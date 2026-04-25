const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

async function run() {
  const configPath = path.join(__dirname, 'config.yml');
  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

  const results = [];

  for (const service of config.services) {
    let status = 'NONE';
    let message = 'No check configured';

    if (service.check && service.check.plugin) {
      console.log(`Checking ${service.name}...`);
      const pluginPath = path.join(__dirname, 'plugins', service.check.plugin);
      const args = service.check.args || [];

      const proc = spawnSync(pluginPath, args, { encoding: 'utf8' });
      
      if (proc.status === 0) {
        status = 'UP';
      } else if (proc.status === 2) {
        status = 'NONE';
      } else {
        status = 'DOWN';
      }
      message = (proc.stdout || '').trim() || (proc.stderr || '').trim() || `Exit code: ${proc.status}`;
    }

    results.push({
      id: service.id,
      name: service.name,
      category: service.category,
      provider: service.provider,
      icon: service.icon,
      tags: service.tags,
      description: service.description,
      recovery: service.recovery,
      depends_on: service.depends_on || [],
      status: status,
      message: message,
      lastCheck: new Date().toISOString()
    });
  }

  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.writeFileSync(
    path.join(outputDir, 'status.json'),
    JSON.stringify({ services: results, updatedAt: new Date().toISOString() }, null, 2)
  );

  console.log('Status dashboard data generated successfully!');
}

run().catch(err => {
  console.error('Error generating status dashboard data:', err);
  process.exit(1);
});
