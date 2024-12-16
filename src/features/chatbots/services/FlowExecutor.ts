import type { 
  FlowExecutionNode, 
  FlowExecutionEdge, 
  FlowExecutionState,
  FlowExecutionContext,
  FlowExecutionOptions,
  NodeExecutionResult
} from '../types/flow';
import { NodeExecutor } from './NodeExecutor';

export class FlowExecutor {
  private nodes: FlowExecutionNode[];
  private edges: FlowExecutionEdge[];
  private state: FlowExecutionState;
  private nodeExecutor: NodeExecutor;
  private options: FlowExecutionOptions;

  constructor(
    nodes: FlowExecutionNode[], 
    edges: FlowExecutionEdge[],
    options: FlowExecutionOptions = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.state = {
      status: 'idle',
      currentNodeId: null,
      variables: {}
    };
    this.nodeExecutor = new NodeExecutor();
    this.options = options;
  }

  async execute(startNodeId?: string): Promise<void> {
    try {
      this.state.status = 'running';
      
      // Se não foi especificado um nó inicial, pega o primeiro nó sem arestas de entrada
      if (!startNodeId) {
        const possibleStartNodes = this.nodes.filter(node => 
          !this.edges.some(edge => edge.target === node.id)
        );
        
        if (possibleStartNodes.length === 0) {
          throw new Error('Não foi possível encontrar um nó inicial');
        }
        
        startNodeId = possibleStartNodes[0].id;
      }

      this.state.currentNodeId = startNodeId;
      
      while (this.state.currentNodeId && this.state.status === 'running') {
        const currentNode = this.nodes.find(n => n.id === this.state.currentNodeId);
        if (!currentNode) break;

        this.options.onNodeStart?.(currentNode.id);

        const context: FlowExecutionContext = {
          variables: this.state.variables,
          getNextNodes: (nodeId) => this.getNextNodes(nodeId),
          updateVariable: (name, value) => {
            this.state.variables[name] = value;
            this.options.onVariableUpdate?.(this.state.variables);
          }
        };

        const result = await this.nodeExecutor.executeNode(currentNode, context);
        
        this.options.onNodeComplete?.(currentNode.id, result);

        if (!result.success) {
          throw new Error(result.error || 'Erro na execução do nó');
        }

        if (result.variables) {
          this.state.variables = {
            ...this.state.variables,
            ...result.variables
          };
          this.options.onVariableUpdate?.(this.state.variables);
        }

        const nextNodes = this.getNextNodes(currentNode.id);
        this.state.currentNodeId = nextNodes[0]?.id || null;
      }

      this.state.status = 'completed';
      this.options.onFlowComplete?.();
    } catch (error) {
      this.state.status = 'error';
      this.state.error = error instanceof Error ? error.message : 'Erro desconhecido';
      this.options.onError?.(error instanceof Error ? error : new Error(this.state.error));
      throw error;
    }
  }

  private getNextNodes(nodeId: string): FlowExecutionNode[] {
    const outgoingEdges = this.edges.filter(e => e.source === nodeId);
    return outgoingEdges
      .map(edge => this.nodes.find(n => n.id === edge.target))
      .filter((node): node is FlowExecutionNode => !!node);
  }

  getState(): FlowExecutionState {
    return { ...this.state };
  }

  pause(): void {
    if (this.state.status === 'running') {
      this.state.status = 'paused';
    }
  }

  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'running';
    }
  }
}