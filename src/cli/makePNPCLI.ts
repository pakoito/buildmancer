import minimist from 'minimist';
import { writeFileSync } from 'node:fs';
import { Item, safeValues } from '../game/types';
import { build, enemies } from '../game/data';

const start = async ({ out }: minimist.ParsedArgs) => {
  const outReal = out ?? 'pnp';
  writeFileSync(
    `${outReal}/items.json`,
    JSON.stringify(
      safeValues(build)
        .flatMap((v) => safeValues<{ [k: string]: Item }, string>(v))
        .map((item) => {
          const passives = item.passives?.join(',') ?? '';
          const elements = (item.bot ?? [])
            .map((a) => ({ ...a, when: 'BOT' }))
            .concat(item.eot?.map((a) => ({ ...a, when: 'EOT' })) ?? [])
            .concat(item.effects?.map((a) => ({ ...a, when: 'MAIN' })) ?? []);
          const effects = elements.reduce(
            (acc, a, idx) => ({
              ...acc,
              [`Name-${idx}`]: a.display,
              [`Phase-${idx}`]: a.when,
              [`Description-${idx}`]: a.tooltip,
              [`Stamina-${idx}`]: a.stamina,
              [`Priority-${idx}`]: a.priority,
              [`Ranges-${idx}`]: a.range.join(','),
              [`Interruptible-${idx}`]: a.interruptible ? 'YES' : 'NO',
            }),
            {}
          );
          return {
            display: item.display,
            ...effects,
            passives,
          };
        }),
      null,
      2
    )
  );
  writeFileSync(`${outReal}/enemies.json`, JSON.stringify(enemies, null, 2));
};

start(minimist(process.argv.slice(2)));
