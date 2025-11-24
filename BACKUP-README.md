# Codex Auto-Backup v1.5

## Overview

Automated backup system that creates timestamped snapshots of:
- **Brain Database** (`codex-brain.db`) - All memory, events, and documents
- **Code Archive** (`codex-code.tar.gz`) - All services and configuration

## Backup Triggers

### 1. Boot Backup
Automatically runs when Codex OS boots successfully via Boot Manager.

### 2. Memory Growth Backup
Monitors Brain database every 60 seconds. If DB grows by >50KB, triggers backup automatically.

### 3. Manual Backup
```bash
npm run codex:backup
```

## Backup Location

```
/Users/amar/Codex/backups/
  codex-backup-2025-11-22T03-35-57-396Z/
    codex-brain.db          (64 KB)
    codex-code.tar.gz       (170 MB)
```

Timestamped folders use ISO format with sanitized characters: `YYYY-MM-DDTHH-MM-SS-mmmZ`

## Restore Instructions

### Restore Brain Database

```bash
# 1. Stop Codex OS
npm run codex:stop

# 2. Backup current DB (optional)
cp codex-brain/codex-brain-data/codex-brain.db codex-brain/codex-brain-data/codex-brain.db.backup

# 3. Restore from backup
cp backups/codex-backup-<timestamp>/codex-brain.db codex-brain/codex-brain-data/codex-brain.db

# 4. Start Codex OS
npm run codex:start
```

### Restore Code

```bash
# 1. Stop Codex OS
npm run codex:stop

# 2. Backup current code (optional)
cd ..
tar -czf codex-current-backup.tar.gz Codex/

# 3. Extract backup
cd Codex/backups/codex-backup-<timestamp>/
tar -xzf codex-code.tar.gz -C ../..

# 4. Reinstall dependencies
cd ../..
cd codex-brain && npm install && npm run build
cd ../codex-bridge && npm install && npm run build
cd ../codex-orchestrator && npm install && npm run build
cd ../codex-hands && npm install && npm run build
cd ../codex-boot-manager && npm install && npm run build

# 5. Start Codex OS
cd ..
npm run codex:start
```

### Restore Full System (Nuclear Option)

```bash
# 1. Stop Codex OS
cd /Users/amar/Codex
npm run codex:stop

# 2. Move current directory
cd /Users/amar
mv Codex Codex-old

# 3. Create fresh Codex directory
mkdir Codex
cd Codex

# 4. Extract code
tar -xzf Codex-old/backups/codex-backup-<timestamp>/codex-code.tar.gz

# 5. Restore Brain DB
mkdir -p codex-brain/codex-brain-data
cp Codex-old/backups/codex-backup-<timestamp>/codex-brain.db codex-brain/codex-brain-data/

# 6. Reinstall all dependencies
cd codex-brain && npm install && npm run build && cd ..
cd codex-bridge && npm install && npm run build && cd ..
cd codex-orchestrator && npm install && npm run build && cd ..
cd codex-hands && npm install && npm run build && cd ..
cd codex-boot-manager && npm install && npm run build && cd ..

# 7. Start Codex OS
npm run codex:start
```

## Configuration

### Memory Watcher Settings
Edit `codex-brain/src/memoryWatcher.ts`:

```typescript
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds
const GROWTH_THRESHOLD_KB = 50;      // Backup if grows >50KB
```

### Backup Retention
Backups are kept indefinitely. To clean up old backups:

```bash
# Delete backups older than 7 days
find /Users/amar/Codex/backups -type d -name "codex-backup-*" -mtime +7 -exec rm -rf {} \;

# Keep only last 10 backups
ls -dt /Users/amar/Codex/backups/codex-backup-* | tail -n +11 | xargs rm -rf
```

## Files Included in Backup

### Brain Database
- All memory events (TurnAppended)
- All documents and chunks
- Session history
- System rules

### Code Archive
- codex-brain/
- codex-bridge/
- codex-orchestrator/
- codex-hands/
- codex-voice/
- codex-desktop/
- codex-boot-manager/
- packages/
- package.json

### Excluded (via .gitignore)
- node_modules/
- dist/
- .env files
- Browser profiles
- Log files

## Monitoring

### View Backup History
```bash
ls -lht /Users/amar/Codex/backups/
```

### Check Backup Size
```bash
du -sh /Users/amar/Codex/backups/codex-backup-*
```

### Test Backup Script
```bash
npm run codex:backup
```

## Troubleshooting

### Backup Script Fails
```bash
# Check permissions
ls -la /Users/amar/Codex/backups/

# Check disk space
df -h /Users/amar/Codex/

# Run with verbose output
node scripts/codexAutoBackup.js
```

### Database Not Found
Brain database is created on first run. Start Brain at least once:
```bash
cd codex-brain
npm start
```

### Memory Watcher Not Triggering
Check Brain logs:
```bash
# Should see: "[Memory Watcher] Starting..."
cd codex-brain
npm start
```

## Architecture

```
┌─────────────────────────────────────────────┐
│          Backup Triggers                    │
├─────────────────────────────────────────────┤
│  1. Boot Manager (after health checks)      │
│  2. Memory Watcher (DB growth >50KB)        │
│  3. Manual (npm run codex:backup)           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ codexAutoBackup.js│
         └──────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│ Copy Brain DB │    │ tar.gz Code    │
│ 64 KB         │    │ 170 MB         │
└───────────────┘    └────────────────┘
        │                     │
        └──────────┬──────────┘
                   ▼
    ┌──────────────────────────────┐
    │  backups/codex-backup-<ts>/  │
    │  ├── codex-brain.db          │
    │  └── codex-code.tar.gz       │
    └──────────────────────────────┘
```

## Version History

### v1.5 (Current)
- Boot backup integration
- Memory growth monitoring
- Timestamped snapshots
- Automatic tar.gz compression
- 64KB Brain DB backup
- 170MB code archive

---

**Status**: ✅ Installed and operational
**Last Updated**: 2025-11-22
