import type { BSDayPlugin, BSDayPluginHost } from '../types';

export class PluginManager {
  private readonly used = new Set<string>();

  use(plugin: BSDayPlugin, host: BSDayPluginHost): void {
    if (this.used.has(plugin.name)) {
      return;
    }

    plugin.initialize(host);
    this.used.add(plugin.name);
  }
}
