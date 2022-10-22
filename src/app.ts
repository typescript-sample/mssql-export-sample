import { createWriteStream, DelimiterFormatter, FileWriter } from 'io-one';
import { ConnectionPool } from 'mssql';
import { Exporter, select, Statement } from 'mssql-core';
import { User, userModel } from './user';

export class QueryBuilder {
  buildQuery = (): Promise<Statement> => {
    const stmt: Statement = {query: select('users3', userModel)};
    return Promise.resolve(stmt);
  }
}

export const db = new ConnectionPool({
  user: 'userA',
  password: '1qaZ2wsX',
  server: 'localhost',
  database: 'masterdata',
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustServerCertificate: true,
    trustedConnection: true,
    encrypt: true,
    enableArithAbort: true,
  },
});

async function exportCSV() {
  const dir = './dest_dir/';
  const writeStream = createWriteStream(dir, 'export.csv');
  const writer = new FileWriter(writeStream);
  // (D) EXPORT TO CSV
  const transform = new DelimiterFormatter<User>(',', userModel);
  const queryBuilder = new QueryBuilder();
  // (D1) ON ERROR
  // const exporter = new ExportService<User>(pool, queryBuilder, transform, writer);
  const exporter = new Exporter<User>(db, queryBuilder.buildQuery, transform.format, writer.write, writer.end, userModel);
  const total = await exporter.export();
  console.log(total);
}

exportCSV();
