import { progressSchema, type Progress } from "./model";
import { mergeProgress } from "./engine";

const DATABASE = "learn-ai";
export async function openProgressDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    let abandoned = false;
    const timeout = setTimeout(() => {
      abandoned = true;
      reject(new Error("Local storage did not respond."));
    }, 4000);
    request.onupgradeneeded = () => request.result.createObjectStore("learner");
    request.onsuccess = () => {
      clearTimeout(timeout);
      if (abandoned) {
        request.result.close();
        return;
      }
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error);
    };
    request.onblocked = () => {
      clearTimeout(timeout);
      abandoned = true;
      reject(new Error("Close older Learn AI tabs to enable local storage."));
    };
  });
}
export async function readProgress(db: IDBDatabase): Promise<Progress | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("learner", "readonly");
    const request = tx.objectStore("learner").get("progress");
    request.onsuccess = () => {
      try {
        resolve(request.result ? progressSchema.parse(request.result) : null);
      } catch {
        reject(
          new Error(
            "Saved progress uses an unsupported format. It has been kept unchanged.",
          ),
        );
      }
    };
    request.onerror = () => reject(request.error);
  });
}
export async function writeProgress(
  db: IDBDatabase,
  incoming: Progress,
): Promise<Progress> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("learner", "readwrite");
    const store = tx.objectStore("learner");
    const request = store.get("progress");
    let merged = incoming;
    request.onsuccess = () => {
      try {
        if (request.result)
          merged = mergeProgress(
            progressSchema.parse(request.result),
            incoming,
            false,
          );
        store.put(merged, "progress");
      } catch (error) {
        tx.abort();
        reject(error);
      }
    };
    tx.oncomplete = () => resolve(merged);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(
        new Error(
          "Progress was not saved. You can export the current session.",
        ),
      );
  });
}
