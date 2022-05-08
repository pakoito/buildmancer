declare module 'pouchdb-collate' {
  export function toIndexableString(obj: any): string;

  export function parseIndexableString<T extends any[]>(s: string): T;
}
