import { PluginManager } from '../plugins/PluginManager';
import { BASE_FORMAT_TOKENS } from '../formatting/formatTokens';
import type { FormatTokenResolver, BSDayFactoryLike, BSDayPluginHost, BSDayPlugin } from '../types';

const pluginManager = new PluginManager();
const formatTokenRegistry: Record<string, FormatTokenResolver> = {
  ...BASE_FORMAT_TOKENS,
};

export const pluginSystem = {
  getFormatTokenRegistry(): Record<string, FormatTokenResolver> {
    return formatTokenRegistry;
  },

  registerFormatToken(token: string, resolver: FormatTokenResolver): void {
    formatTokenRegistry[token] = resolver;
  },

  use(plugin: BSDayPlugin, host: BSDayPluginHost, factory?: BSDayFactoryLike, options?: unknown): void {
    pluginManager.use(plugin, host, factory, options);
  },

  extend(plugin: BSDayPlugin, host: BSDayPluginHost, factory?: BSDayFactoryLike, options?: unknown): void {
    this.use(plugin, host, factory, options);
  },
};
