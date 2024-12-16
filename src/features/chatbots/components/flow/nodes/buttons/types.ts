export interface BaseButtonConfig {
  label: string;
}

export interface ActionButtonConfig extends BaseButtonConfig {
  action: 'url' | 'phone' | 'share' | 'flow';
  value: string;
}

export interface ListButtonConfig extends BaseButtonConfig {
  buttons: {
    label: string;
    value: string;
  }[];
}

export interface QuickReplyConfig extends BaseButtonConfig {
  options: string[];
}