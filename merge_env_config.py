#!/usr/bin/env python3
"""
Environment Configuration Merger for Femora
This script helps merge your existing .env file with new network configuration
while preserving all your important keys like Google API, Firebase, etc.
"""

import os
import shutil
from pathlib import Path

def merge_environment_config():
    """Merge existing .env with new network configuration"""
    
    print("🔧 Femora Environment Configuration Merger")
    print("=" * 50)
    
    # Get the current directory (should be Femora folder)
    current_dir = Path.cwd()
    env_file = current_dir / ".env"
    backup_file = current_dir / ".env.backup"
    template_file = current_dir / ".env.template"
    
    # If we're in the wrong directory, try to find the Femora folder
    if not (current_dir / "config").exists() and (current_dir.parent / "Femora").exists():
        current_dir = current_dir.parent / "Femora"
        env_file = current_dir / ".env"
        backup_file = current_dir / ".env.backup"
        template_file = current_dir / ".env.template"
        print(f"📁 Switched to Femora directory: {current_dir}")
    
    print(f"Current directory: {current_dir}")
    print(f"Environment file: {env_file}")
    print(f"Template file: {template_file}")
    print()
    
    # Check if .env exists
    if env_file.exists():
        print("✅ Found existing .env file")
        
        # Create backup
        shutil.copy2(env_file, backup_file)
        print(f"💾 Created backup: {backup_file}")
        
        # Read existing .env
        with open(env_file, 'r', encoding='utf-8') as f:
            existing_content = f.read()
        
        print(f"📖 Read existing .env ({len(existing_content)} characters)")
        
        # Check if it already has network configuration
        if "DEV_BACKEND_HOST=10.133.147.50" in existing_content:
            print("ℹ️  Network configuration already exists in .env")
            print("   No changes needed!")
            return
        
        # Read template
        if template_file.exists():
            with open(template_file, 'r', encoding='utf-8') as f:
                template_content = f.read()
            
            print(f"📖 Read template file ({len(template_content)} characters)")
            
            # Extract network configuration section
            network_start = template_content.find("# ========================================")
            network_end = template_content.find("# ========================================", network_start + 1)
            network_end = template_content.find("# ========================================", network_end + 1)
            
            if network_start != -1 and network_end != -1:
                network_config = template_content[network_start:network_end]
                
                # Add network configuration to existing .env
                merged_content = existing_content + "\n\n" + network_config
                
                # Write merged content
                with open(env_file, 'w', encoding='utf-8') as f:
                    f.write(merged_content)
                
                print("✅ Successfully merged network configuration into .env")
                print("   Your existing configuration has been preserved")
                print("   Network settings for Android compatibility added")
                
            else:
                print("❌ Could not extract network configuration from template")
                
        else:
            print("❌ Template file not found")
            print("   Please ensure env_complete_android.ini exists")
            
    else:
        print("ℹ️  No existing .env file found")
        
        if template_file.exists():
            print("📋 Creating new .env from template...")
            
            # Copy template to .env
            shutil.copy2(template_file, env_file)
            
            print("✅ Created new .env file from template")
            print("⚠️  IMPORTANT: You need to fill in your actual values:")
            print("   - Google API keys")
            print("   - Firebase credentials")
            print("   - Other sensitive information")
            
        else:
            print("❌ Template file not found")
            print("   Please ensure env_complete_android.ini exists")
    
    print()
    print("📋 Next Steps:")
    print("1. Review your .env file to ensure all values are correct")
    print("2. Replace placeholder values with your actual credentials")
    print("3. Start the backends using: ./start_backends_for_android.sh")
    print("4. Test Android connectivity")

if __name__ == "__main__":
    merge_environment_config()
