#!/usr/bin/env python3
"""
Network Diagnostic Script for Femora
This script checks the current network status and helps diagnose connectivity issues
"""

import socket
import subprocess
import requests
import time

def check_port_status(port):
    """Check if a port is open and listening"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result == 0
    except:
        return False

def check_network_connectivity(ip, port):
    """Check if a service is accessible from network IP"""
    try:
        response = requests.get(f"http://{ip}:{port}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_network_ip():
    """Get the current network IP address"""
    try:
        # Get network interfaces
        result = subprocess.run(['ifconfig'], capture_output=True, text=True)
        if result.returncode == 0:
            lines = result.stdout.split('\n')
            for line in lines:
                if 'inet ' in line and '127.0.0.1' not in line and '169.254.' not in line:
                    ip_match = line.split()[1]
                    if ip_match.startswith(('192.168.', '10.', '172.')):
                        return ip_match
    except:
        pass
    return "10.133.147.50"  # Fallback to known IP

def main():
    print("🔍 Femora Network Diagnostic")
    print("=" * 40)
    
    # Get current network IP
    network_ip = get_network_ip()
    print(f"🌐 Network IP: {network_ip}")
    print()
    
    # Check backend ports
    print("🔌 Checking Backend Ports:")
    print("-" * 30)
    
    ports = {
        'Image Backend': 8000,
        'Mora Backend': 5002
    }
    
    for name, port in ports.items():
        local_status = check_port_status(port)
        network_status = check_network_connectivity(network_ip, port)
        
        print(f"{name} (Port {port}):")
        print(f"  Local (127.0.0.1): {'✅ OK' if local_status else '❌ FAILED'}")
        print(f"  Network ({network_ip}): {'✅ OK' if network_status else '❌ FAILED'}")
        print()
    
    # Recommendations
    print("💡 Recommendations:")
    print("-" * 30)
    
    if not check_port_status(8000):
        print("1. Start Image Backend: cd backend && ./start_image_backend.sh")
    
    if not check_port_status(5002):
        print("2. Start Mora Backend: cd mora && python start_mora.py")
    
    print("3. Ensure backends are bound to 0.0.0.0 (not just localhost)")
    print("4. Check macOS firewall settings")
    print("5. Verify both devices are on the same WiFi network")
    
    print()
    print("🧪 Test commands:")
    print(f"   curl http://127.0.0.1:8000/health")
    print(f"   curl http://{network_ip}:8000/health")
    print(f"   curl http://127.0.0.1:5002/health")
    print(f"   curl http://{network_ip}:5002/health")

if __name__ == "__main__":
    main()
