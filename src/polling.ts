import {randomUUID as genUuid} from 'node:crypto';

export const POLLING_ABORT = 'ABORT';
export const POLLING_ACTIVE = 'ACTIVE';

const pollingStates = new Map();

export const addPolling = (uuid?: string): string | null => {
  console.log("Crypto work?", uuid);
  if (uuid && pollingStates.has(uuid)) return null;
  const newUuid = uuid || genUuid();
  pollingStates.set(newUuid, POLLING_ACTIVE);
  return newUuid;
};
export const abortPolling = (uuid: string) => {
  pollingStates.has(uuid) ? pollingStates.set(uuid, POLLING_ABORT) : false;
};

export const deletePolling = (uuid: string) => {
  pollingStates.delete(uuid);
};
export const statusPolling = (uuid: string) => {
  const result = pollingStates.get(uuid);
  return result;
};
export const deleteAllPollings = () => pollingStates.clear();

export const curryAFunc =
  (func:any, ...params:any[]) =>
  async () =>
    func(...params);

export const awaitTruthyPromiseWithPolling = async ({
  taskAsync,
  pollingId,
  timeOut = 5000,
  timeInterval = 1000,
}: {
  taskAsync: () => Promise<any>;
  pollingId: string;
  timeOut?: number;
  timeInterval?: number;
}) => {
  const numRepeat = Math.floor(timeOut / timeInterval);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  if (!addPolling(pollingId)) return false;
  const result = await Array(numRepeat)
    .fill(0)
    .reduce(async p => {
      if (await p) return p;
      if (statusPolling(pollingId) !== POLLING_ACTIVE)
        return Promise.reject(new Error('Error:Aborted'));

      const taskRes = await taskAsync();
      !taskRes && (await delay(timeInterval));
      return taskRes;
    }, Promise.resolve(false))
    .catch((error: any) => {
      deletePolling(pollingId);
      throw new Error('Error:PollingFailed');
    });
  deletePolling(pollingId);
  if (!result) {
    throw new Error('Error:TimeOut');
  }
  return result;
};
