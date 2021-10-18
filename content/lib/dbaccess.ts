var datastore = require("../lib/nedb");

interface Collections {
  accounts: Nedb;
  recurringEvents: Nedb;
  singleEvents: Nedb;
}

export const db: Collections = {
  accounts: new datastore({ filename: "jet_accounts.db", autoload: true }),
  recurringEvents: new datastore({
    filename: "jet_recevents.db",
    autoload: true,
  }),
  singleEvents: new datastore({ filename: "jet_sinevents.db", autoload: true }),
};

export async function getDbContentForExport(): Promise<string> {
  const getAccounts = new Promise<any[]>((resolve, reject) => {
    db.accounts.find({}, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });

  const getRecEvents = new Promise<any[]>((resolve, reject) => {
    db.recurringEvents.find({}, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });

  const getSinEvents = new Promise<any[]>((resolve, reject) => {
    db.singleEvents.find({}, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      resolve(docs);
    });
  });

  const [accounts, recEvents, sinEvents] = await Promise.all([
    getAccounts,
    getRecEvents,
    getSinEvents,
  ]);
  return JSON.stringify({
    accounts: [...accounts],
    recurringEvents: [...recEvents],
    singleEvents: [...sinEvents],
  });
}

export async function importDbContent(content: string): Promise<void> {
  const dbContent = JSON.parse(content) as {
    accounts: any[];
    recurringEvents: any[];
    singleEvents: any[];
  };

  await new Promise<void>((resolve, reject) => {
    db.accounts.remove(
      {},
      { multi: true },
      (err: Error | null, count: number) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  await new Promise<void>((resolve, reject) => {
    db.recurringEvents.remove(
      {},
      { multi: true },
      (err: Error | null, count: number) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  await new Promise<void>((resolve, reject) => {
    db.singleEvents.remove(
      {},
      { multi: true },
      (err: Error | null, count: number) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  const insertAccounts = new Promise<void>((resolve, reject) => {
    db.accounts.insert(dbContent.accounts, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      resolve();
    });
  });

  const insertRecEvents = new Promise<void>((resolve, reject) => {
    db.recurringEvents.insert(
      dbContent.recurringEvents,
      (err: Error | null, docs: any[]) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  const insertSinEvents = new Promise<void>((resolve, reject) => {
    db.singleEvents.insert(
      dbContent.singleEvents,
      (err: Error | null, docs: any[]) => {
        if (err) reject(err);
        resolve();
      }
    );
  });

  await Promise.all([insertAccounts, insertRecEvents, insertSinEvents]);
}
