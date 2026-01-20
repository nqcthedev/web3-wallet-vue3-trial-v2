import { type Config, type ResolvedRegister, type WatchBlockNumberParameters } from '@wagmi/core';
import type { UnionCompute, UnionExactPartial } from '@wagmi/core/internal';
import type { ConfigParameter, EnabledParameter } from '../types/properties.js';
import type { DeepMaybeRef } from '../types/ref.js';
export type UseWatchBlockNumberParameters<config extends Config = Config, chainId extends config['chains'][number]['id'] = config['chains'][number]['id']> = DeepMaybeRef<UnionCompute<UnionExactPartial<WatchBlockNumberParameters<config, chainId>> & ConfigParameter<config> & EnabledParameter>>;
export type UseWatchBlockNumberReturnType = void;
/** https://wagmi.sh/vue/api/composables/useWatchBlockNumber */
export declare function useWatchBlockNumber<config extends Config = ResolvedRegister['config'], chainId extends config['chains'][number]['id'] = config['chains'][number]['id']>(parameters_?: UseWatchBlockNumberParameters<config, chainId>): UseWatchBlockNumberReturnType;
//# sourceMappingURL=useWatchBlockNumber.d.ts.map