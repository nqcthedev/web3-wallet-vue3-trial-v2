import { type Config, type ResolvedRegister, type WatchContractEventParameters } from '@wagmi/core';
import type { UnionCompute, UnionExactPartial } from '@wagmi/core/internal';
import type { Abi, ContractEventName } from 'viem';
import type { ConfigParameter, EnabledParameter } from '../types/properties.js';
import type { DeepMaybeRef } from '../types/ref.js';
export type UseWatchContractEventParameters<abi extends Abi | readonly unknown[] = Abi, eventName extends ContractEventName<abi> = ContractEventName<abi>, strict extends boolean | undefined = undefined, config extends Config = Config, chainId extends config['chains'][number]['id'] = config['chains'][number]['id']> = DeepMaybeRef<UnionCompute<UnionExactPartial<WatchContractEventParameters<abi, eventName, strict, config, chainId>> & ConfigParameter<config> & EnabledParameter>>;
export type UseWatchContractEventReturnType = void;
/** https://wagmi.sh/vue/api/composables/useWatchContractEvent */
export declare function useWatchContractEvent<const abi extends Abi | readonly unknown[], eventName extends ContractEventName<abi>, strict extends boolean | undefined = undefined, config extends Config = ResolvedRegister['config'], chainId extends config['chains'][number]['id'] = config['chains'][number]['id']>(parameters?: UseWatchContractEventParameters<abi, eventName, strict, config, chainId>): UseWatchContractEventReturnType;
//# sourceMappingURL=useWatchContractEvent.d.ts.map