module.exports = async function beforeAdd() {
  const util = await import('util');
  const child = await import('child_process');
  const spawnAsync = util.promisify(child.spawn);
  console.log('Updating itch');
  let result;
  try {
    result = await spawnAsync('./itch/butler', ['push', './build', 'pakoito/buildmancer:alpha'], { stdio: 'inherit' });
    console.log('Updated itch');
  } catch (err) {
    console.log(`FAILED updating itch ${err}`);
  }
  result && console.log(result.stdout);
  result && console.log(result.stderr);
}
