async function start() {
  const util = await import('util');
  const child = await import('child_process');
  const spawnAsync = util.promisify(child.spawn);
  console.log('Updating itch');
  try {
    await spawnAsync('./itch/butler', ['push', './itch/index.html', 'pakoito/buildmancer:alpha'], { stdio: 'inherit' });
    console.log('Updated itch');
  } catch (err) {
    console.log(`FAILED updating itch ${err}`);
  }

  return true;
}

start();