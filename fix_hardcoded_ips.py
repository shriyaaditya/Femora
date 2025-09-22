#!/usr/bin/env python3
"""
Comprehensive script to find and fix all hardcoded IP addresses
This ensures everything uses environment variables consistently
"""

import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple

class HardcodedIPFixer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.backup_dir = self.project_root / "backups" / "hardcoded_ip_fix"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # IP patterns to find and replace
        self.ip_patterns = [
            # Old network IPs
            (r'192\.168\.0\.115', '${DEV_BACKEND_HOST:-10.133.147.50}'),
            (r'192\.168\.28\.179', '${DEV_BACKEND_HOST:-10.133.147.50}'),
            
            # Localhost patterns (keep some for local development)
            (r'${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}', '${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}'),
            (r'${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}', '${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}'),
            (r'${DEV_FRONTEND_HOST:-localhost}:${DEV_FRONTEND_PORT:-8081}', '${DEV_FRONTEND_HOST:-localhost}:${DEV_FRONTEND_PORT:-8081}'),
            
            # Hardcoded URLs
            (r'http://192\.168\.0\.115:5002', '${DEV_MORA_BACKEND_URL}'),
            (r'http://192\.168\.0\.115:8000', '${DEV_IMAGE_BACKEND_URL}'),
            (r'http://192\.168\.0\.115:8081', '${DEV_FRONTEND_URL}'),
        ]
        
        # Files to exclude
        self.exclude_patterns = [
            "node_modules/**",
            "venv/**",
            ".git/**",
            "*.pyc",
            "*.log",
            "*.md",  # Don't modify documentation
            "*.txt",
            "*.json",
            "*.xml",
            "*.yml",
            "*.yaml"
        ]

    def should_exclude_file(self, file_path: Path) -> bool:
        """Check if file should be excluded from updates."""
        for pattern in self.exclude_patterns:
            if file_path.match(pattern):
                return True
        return False

    def find_files_with_hardcoded_ips(self) -> List[Path]:
        """Find all files that contain hardcoded IP addresses."""
        files_to_update = []
        
        for file_path in self.project_root.rglob('*'):
            if file_path.is_file() and not self.should_exclude_file(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Check if file contains any hardcoded IPs
                        if any(re.search(pattern, content) for pattern, _ in self.ip_patterns):
                            files_to_update.append(file_path)
                            
                except (UnicodeDecodeError, PermissionError):
                    continue
        
        return files_to_update

    def backup_file(self, file_path: Path) -> Path:
        """Create a backup of the original file."""
        backup_path = self.backup_dir / f"{file_path.name}.backup"
        shutil.copy2(file_path, backup_path)
        return backup_path

    def update_file(self, file_path: Path) -> bool:
        """Update a file to replace hardcoded IPs with environment variables."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            changes_made = False
            
            # Apply all IP pattern replacements
            for pattern, replacement in self.ip_patterns:
                new_content = re.sub(pattern, replacement, content)
                if new_content != content:
                    content = new_content
                    changes_made = True
            
            # If content changed, write it back
            if changes_made:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            
            return False
            
        except Exception as e:
            print(f"Error updating {file_path}: {e}")
            return False

    def fix_all_hardcoded_ips(self) -> Tuple[int, int]:
        """Fix all hardcoded IP addresses in the project."""
        files_to_update = self.find_files_with_hardcoded_ips()
        updated_count = 0
        total_count = len(files_to_update)
        
        print(f"Found {total_count} files with hardcoded IP addresses...")
        
        for file_path in files_to_update:
            print(f"Processing: {file_path.relative_to(self.project_root)}")
            
            # Create backup
            backup_path = self.backup_file(file_path)
            print(f"  Backup created: {backup_path}")
            
            # Update file
            if self.update_file(file_path):
                updated_count += 1
                print(f"  ✅ Updated successfully")
            else:
                print(f"  ⚠️  No changes needed")
        
        return updated_count, total_count

    def create_fix_summary(self):
        """Create a summary of what was fixed."""
        summary_content = f"""# Hardcoded IP Fix Summary

## What Was Fixed

This script has replaced all hardcoded IP addresses with environment variables.

## IP Addresses Replaced

- **${DEV_BACKEND_HOST:-10.133.147.50}** → `${DEV_BACKEND_HOST:-10.133.147.50}`
- **${DEV_BACKEND_HOST:-10.133.147.50}** → `${DEV_BACKEND_HOST:-10.133.147.50}`
- **${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}** → `${DEV_MORA_BACKEND_HOST:-localhost}:${DEV_MORA_BACKEND_PORT:-5002}`
- **${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}** → `${DEV_IMAGE_BACKEND_HOST:-localhost}:${DEV_IMAGE_BACKEND_PORT:-8000}`

## Environment Variables Used

- `DEV_BACKEND_HOST` - Main backend host IP
- `DEV_MORA_BACKEND_URL` - Complete Mora backend URL
- `DEV_IMAGE_BACKEND_URL` - Complete image backend URL
- `DEV_FRONTEND_URL` - Complete frontend URL

## Benefits

✅ **Consistent Configuration**: All IPs now come from one place  
✅ **Easy Network Changes**: Change IP in .env, everything updates  
✅ **Android Compatibility**: Network IPs work across devices  
✅ **No More Inconsistencies**: All services use same configuration  

## Next Steps

1. **Ensure .env file exists** in the Femora folder
2. **Start backends**: `./start_backends_for_android.sh`
3. **Test connectivity**: `./test_network_connectivity.sh`

---
**Status**: ✅ Hardcoded IPs fixed  
**Backups**: Saved in `backups/hardcoded_ip_fix/`
"""
        
        summary_path = self.project_root / "HARDCODED_IP_FIX_SUMMARY.md"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary_content)
        
        print(f"📋 Fix summary created: {summary_path}")

def main():
    """Main function to fix all hardcoded IP addresses."""
    project_root = os.getcwd()
    
    print("🔧 Femora Hardcoded IP Fixer")
    print("=" * 50)
    print(f"Project root: {project_root}")
    
    # Check if we're in the right directory
    if not (Path(project_root) / "config").exists():
        print("❌ Error: Please run this script from the Femora folder")
        print("   Current directory should contain: config/, services/, backend/")
        return
    
    fixer = HardcodedIPFixer(project_root)
    
    # Confirm before proceeding
    response = input("\nThis will replace all hardcoded IP addresses with environment variables. Continue? (y/N): ")
    if response.lower() != 'y':
        print("Operation cancelled.")
        return
    
    print("\nStarting hardcoded IP fix...")
    
    try:
        updated_count, total_count = fixer.fix_all_hardcoded_ips()
        
        print(f"\n✅ Fix completed!")
        print(f"Files processed: {total_count}")
        print(f"Files updated: {updated_count}")
        
        # Create summary
        fixer.create_fix_summary()
        
        print(f"\n📚 Fix summary created: HARDCODED_IP_FIX_SUMMARY.md")
        print(f"💾 Backups saved in: {fixer.backup_dir}")
        
    except Exception as e:
        print(f"\n❌ Error during fix: {e}")
        print("Check the backup files for recovery.")

if __name__ == "__main__":
    main()
