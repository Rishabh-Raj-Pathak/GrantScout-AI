from dotenv import load_dotenv
from portia import (
    Portia,
    default_config,
    example_tool_registry,
)

load_dotenv('../.env')

def test_portia_setup():
    """Test Portia SDK setup with a simple query"""
    try:
        # Instantiate Portia with the default config and example tools
        portia = Portia(tools=example_tool_registry)
        
        # Run the test query
        plan_run = portia.run('add 1 + 2')
        
        print("✅ Portia SDK Test Successful!")
        print("Plan Run Result:")
        print(plan_run.model_dump_json(indent=2))
        
        return True
        
    except Exception as e:
        print(f"❌ Portia SDK Test Failed: {str(e)}")
        return False

if __name__ == '__main__':
    print("Testing Portia SDK setup...")
    test_portia_setup()
