#!/usr/bin/env python3
"""
Femora Backend Cost Calculator
Calculate monthly costs for Google Cloud Run services
"""

def calculate_cloud_run_cost(cpu_seconds, memory_gib_seconds, requests):
    """
    Calculate Google Cloud Run costs based on usage
    
    Args:
        cpu_seconds: Total vCPU seconds used
        memory_gib_seconds: Total GiB seconds used  
        requests: Total number of requests
    
    Returns:
        Dictionary with cost breakdown
    """
    
    # Free tier allowances (monthly)
    FREE_CPU_SECONDS = 240000
    FREE_MEMORY_GIB_SECONDS = 450000
    FREE_REQUESTS = 2000000
    
    # Pricing (Tier 1 regions)
    CPU_RATE = 0.000018  # per vCPU-second
    MEMORY_RATE = 0.000002  # per GiB-second
    REQUEST_RATE = 0.40  # per million requests
    
    # Calculate billable usage
    billable_cpu = max(0, cpu_seconds - FREE_CPU_SECONDS)
    billable_memory = max(0, memory_gib_seconds - FREE_MEMORY_GIB_SECONDS)
    billable_requests = max(0, requests - FREE_REQUESTS)
    
    # Calculate costs
    cpu_cost = billable_cpu * CPU_RATE
    memory_cost = billable_memory * MEMORY_RATE
    request_cost = (billable_requests / 1000000) * REQUEST_RATE
    
    total_cost = cpu_cost + memory_cost + request_cost
    
    return {
        'cpu_cost_usd': cpu_cost,
        'memory_cost_usd': memory_cost,
        'request_cost_usd': request_cost,
        'total_cost_usd': total_cost,
        'total_cost_inr': total_cost * 83,  # Approximate conversion
        'billable_cpu': billable_cpu,
        'billable_memory': billable_memory,
        'billable_requests': billable_requests
    }

def estimate_user_usage(users, avg_requests_per_user=100, avg_cpu_per_request=2, avg_memory_per_request=4):
    """
    Estimate usage based on user count
    
    Args:
        users: Number of active users
        avg_requests_per_user: Average requests per user per month
        avg_cpu_per_request: Average CPU seconds per request
        avg_memory_per_request: Average memory GiB seconds per request
    
    Returns:
        Dictionary with usage estimates
    """
    
    total_requests = users * avg_requests_per_user
    total_cpu = users * avg_requests_per_user * avg_cpu_per_request
    total_memory = users * avg_requests_per_user * avg_memory_per_request
    
    return {
        'users': users,
        'total_requests': total_requests,
        'total_cpu_seconds': total_cpu,
        'total_memory_gib_seconds': total_memory
    }

def main():
    """Main function to demonstrate cost calculations"""
    
    print("🏷️ Femora Backend Cost Calculator")
    print("=" * 50)
    
    # Scenario calculations
    scenarios = [
        ("Development", 50, 20, 1, 2),
        ("Beta Testing", 200, 50, 2, 4),
        ("Early Production", 1000, 100, 3, 6),
        ("Active Production", 5000, 200, 5, 10)
    ]
    
    budget_inr = 5000
    budget_usd = budget_inr / 83
    
    print(f"📊 Budget: ₹{budget_inr:,} (${budget_usd:.2f})")
    print()
    
    for scenario_name, users, requests_per_user, cpu_per_request, memory_per_request in scenarios:
        print(f"📈 {scenario_name} ({users:,} users)")
        print("-" * 30)
        
        # Calculate usage
        usage = estimate_user_usage(users, requests_per_user, cpu_per_request, memory_per_request)
        
        # Calculate costs for both services
        cost_per_service = calculate_cloud_run_cost(
            usage['total_cpu_seconds'],
            usage['total_memory_gib_seconds'],
            usage['total_requests']
        )
        
        # Total cost for both services
        total_cost_usd = cost_per_service['total_cost_usd'] * 2
        total_cost_inr = cost_per_service['total_cost_inr'] * 2
        
        # Additional services (GCS + Firestore)
        additional_cost_inr = 500 + (users * 2)  # Base cost + per user
        total_with_additional = total_cost_inr + additional_cost_inr
        
        print(f"  Users: {users:,}")
        print(f"  Requests: {usage['total_requests']:,}")
        print(f"  CPU Seconds: {usage['total_cpu_seconds']:,}")
        print(f"  Memory GiB Seconds: {usage['total_memory_gib_seconds']:,}")
        print(f"  Cloud Run Cost: ₹{total_cost_inr:,.0f}")
        print(f"  Additional Services: ₹{additional_cost_inr:,.0f}")
        print(f"  Total Cost: ₹{total_with_additional:,.0f}")
        
        # Budget status
        budget_percentage = (total_with_additional / budget_inr) * 100
        if budget_percentage <= 50:
            status = "✅ SAFE"
        elif budget_percentage <= 90:
            status = "⚠️ WARNING"
        elif budget_percentage <= 100:
            status = "🚨 ALERT"
        else:
            status = "❌ EXCEEDED"
        
        print(f"  Budget Usage: {budget_percentage:.1f}% {status}")
        print()

def interactive_calculator():
    """Interactive cost calculator"""
    
    print("\n🔧 Interactive Cost Calculator")
    print("=" * 40)
    
    try:
        users = int(input("Enter number of users: "))
        requests_per_user = int(input("Enter requests per user per month (default 100): ") or "100")
        cpu_per_request = float(input("Enter CPU seconds per request (default 2): ") or "2")
        memory_per_request = float(input("Enter memory GiB seconds per request (default 4): ") or "4")
        
        # Calculate usage
        usage = estimate_user_usage(users, requests_per_user, cpu_per_request, memory_per_request)
        
        # Calculate costs
        cost_per_service = calculate_cloud_run_cost(
            usage['total_cpu_seconds'],
            usage['total_memory_gib_seconds'],
            usage['total_requests']
        )
        
        total_cost_usd = cost_per_service['total_cost_usd'] * 2
        total_cost_inr = cost_per_service['total_cost_inr'] * 2
        additional_cost_inr = 500 + (users * 2)
        total_with_additional = total_cost_inr + additional_cost_inr
        
        print(f"\n📊 Cost Analysis for {users:,} users:")
        print(f"  Total Monthly Cost: ₹{total_with_additional:,.0f}")
        print(f"  Cost per User: ₹{total_with_additional/users:.2f}")
        print(f"  Budget Usage: {(total_with_additional/5000)*100:.1f}%")
        
    except ValueError:
        print("❌ Invalid input. Please enter numbers only.")

if __name__ == "__main__":
    main()
    interactive_calculator()


