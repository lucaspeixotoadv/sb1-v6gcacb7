@@ .. @@
   const addPipeline = (name: string, type: Pipeline['type'], parentId?: string) => {
     const newPipeline: Pipeline = {
       id: `pipeline-${uuidv4()}`,
-      name,
+      name: type === 'custom' ? `Pipeline de ${name}` : name,
       type,
       parentId,
       color: '#4F46E5',