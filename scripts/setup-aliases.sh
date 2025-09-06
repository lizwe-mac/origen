#!/bin/bash

# Origen Project Aliases Setup Script

ORIGEN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Create aliases content
ALIASES_CONTENT="
# Origen Project Aliases
alias db-start='$ORIGEN_ROOT/scripts/dev-db.sh start'
alias db-stop='$ORIGEN_ROOT/scripts/dev-db.sh stop'
alias db-reset='$ORIGEN_ROOT/scripts/dev-db.sh reset'
alias db-migrate='$ORIGEN_ROOT/scripts/dev-db.sh migrate'
alias db-pgadmin='$ORIGEN_ROOT/scripts/dev-db.sh pgadmin'
alias db-logs='$ORIGEN_ROOT/scripts/dev-db.sh logs'

alias env-local='$ORIGEN_ROOT/scripts/switch-env.sh local'
alias env-supabase='$ORIGEN_ROOT/scripts/switch-env.sh supabase'

# Quick development workflow
alias dev-start='env-local && db-start && echo \"Ready for development!\"'
alias dev-fresh='db-reset && echo \"Fresh development environment ready!\"'
"

# Function to add aliases to shell config
add_to_shell_config() {
    local config_file="$1"
    local shell_name="$2"
    
    if [ -f "$config_file" ]; then
        # Check if aliases already exist
        if grep -q "# Origen Project Aliases" "$config_file"; then
            echo "Aliases already exist in $config_file"
            return
        fi
        
        echo "$ALIASES_CONTENT" >> "$config_file"
        echo "✓ Added Origen aliases to $config_file"
        echo "  Run 'source $config_file' or restart your terminal to use them"
    else
        echo "Creating $config_file and adding aliases..."
        echo "$ALIASES_CONTENT" > "$config_file"
        echo "✓ Created $config_file with Origen aliases"
    fi
}

echo "Setting up Origen project aliases..."
echo "Project root: $ORIGEN_ROOT"
echo

# Detect shell and add aliases
if [ -n "$BASH_VERSION" ]; then
    add_to_shell_config "$HOME/.bashrc" "bash"
elif [ -n "$ZSH_VERSION" ]; then
    add_to_shell_config "$HOME/.zshrc" "zsh"
else
    # Try both common shells
    add_to_shell_config "$HOME/.bashrc" "bash"
    add_to_shell_config "$HOME/.zshrc" "zsh"
fi

echo
echo "Available aliases:"
echo "  Database Management:"
echo "    db-start      - Start PostgreSQL database"
echo "    db-stop       - Stop database"
echo "    db-reset      - Reset database (deletes all data)"
echo "    db-migrate    - Run Prisma migration"
echo "    db-pgadmin    - Start pgAdmin web interface"
echo "    db-logs       - Show database logs"
echo
echo "  Environment Switching:"
echo "    env-local     - Switch to local PostgreSQL"
echo "    env-supabase  - Switch to Supabase cloud"
echo
echo "  Quick Workflows:"
echo "    dev-start     - Switch to local env and start database"
echo "    dev-fresh     - Reset database for fresh start"
echo
echo "To activate aliases now, run:"
echo "  source ~/.bashrc    # for bash"
echo "  source ~/.zshrc     # for zsh"
