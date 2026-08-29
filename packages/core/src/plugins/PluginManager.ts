import type { BSDayFactoryLike, BSDayPlugin, BSDayPluginHost } from '../types';

export class PluginManager {
  private readonly used = new Set<BSDayPlugin | string>();

  use(
    plugin: BSDayPlugin,
    host: BSDayPluginHost,
    factory?: BSDayFactoryLike,
    options?: unknown,
  ): void {
    if (this.used.has(plugin)) {
      return;
    }

    if (typeof plugin === 'function') {
      plugin(options, host, factory);
      this.used.add(plugin);
      return;
    }

    if (plugin && typeof plugin === 'object' && typeof plugin.initialize === 'function') {
      if (this.used.has(plugin.name)) {
        return;
      }
      plugin.initialize(host, options);
      this.used.add(plugin.name);
      this.used.add(plugin);
      return;
    }

    throw new TypeError('Invalid BSDay plugin: must be a function or an object with initialize()');
  }
}
