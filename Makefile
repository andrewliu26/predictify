# Variables
FRONTEND_DIR = frontend
BACKEND_DIR = backend
PYTHON = python
VENV_NAME = venv
VENV_BIN = $(BACKEND_DIR)/$(VENV_NAME)/bin
VENV_PYTHON = $(VENV_BIN)/python
NPM = npm

# Colors for prettier output
BLUE = \033[34m
GREEN = \033[32m
RESET = \033[0m

.PHONY: all install start stop clean help

# Default target
all: help

# Install dependencies for both frontend and backend
install:
	@echo "$(BLUE)Installing frontend dependencies...$(RESET)"
	cd $(FRONTEND_DIR) && $(NPM) install
	@echo "$(BLUE)Installing backend dependencies...$(RESET)"
	cd $(BACKEND_DIR) && $(PYTHON) -m venv $(VENV_NAME)
	cd $(BACKEND_DIR) && . $(VENV_NAME)/bin/activate && pip install -r requirements.txt

# Start both servers
start:
	@echo "$(GREEN)Starting servers...$(RESET)"
	@make -j 2 start-frontend start-backend

# Start frontend server
start-frontend:
	@echo "$(BLUE)Starting frontend server...$(RESET)"
	cd $(FRONTEND_DIR) && $(NPM) run dev

# Start backend server
start-backend:
	@echo "$(BLUE)Starting backend server...$(RESET)"
	cd $(BACKEND_DIR) && . $(VENV_NAME)/bin/activate && $(PYTHON) main.py

# Stop servers (this will work on Unix-like systems)
stop:
	@echo "$(BLUE)Stopping servers...$(RESET)"
	@-pkill -f "node.*next dev" 2>/dev/null || true
	@-pkill -f "python.*main.py" 2>/dev/null || true

# Clean up generated files
clean:
	@echo "$(BLUE)Cleaning up...$(RESET)"
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/.next
	rm -rf $(BACKEND_DIR)/$(VENV_NAME)
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete

# Display help information
help:
	@echo "$(GREEN)Available commands:$(RESET)"
	@echo "  make install      - Install all dependencies"
	@echo "  make start        - Start both frontend and backend servers"
	@echo "  make stop         - Stop all servers"
	@echo "  make clean        - Remove all generated files"
	@echo "  make help         - Show this help message"