# Task Manager Application Setup Guide

## Development Environment Setup

### 1. Required Software
1. **Visual Studio Code**
   - Download from: https://code.visualstudio.com/
   - Recommended version: Latest stable

2. **Node.js**
   - Download from: https://nodejs.org/
   - Required version: v14 or higher
   - Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. VS Code Extensions
1. **GitHub Copilot**
   - Install from VS Code Extensions Marketplace
   - Search for: "GitHub Copilot"
   - Or run:
   ```powershell
   code --install-extension GitHub.copilot
   ```
   - Sign in to GitHub account
   - Verify you have an active GitHub Copilot subscription

2. **Required Extensions**
   ```powershell
   code --install-extension dbaeumer.vscode-eslint
   code --install-extension esbenp.prettier-vscode
   ```

### 3. GitHub Repository Setup
1. **Clone the Repository**
   ```powershell
   git clone https://github.com/yourusername/task_manager_Demo.git
   cd task_manager_Demo
   ```

## Project Setup

### 1. Backend Setup
Navigate to backend directory and install dependencies:
```powershell
cd backend
npm install
```

**Backend Dependencies:**
- Production:
  - express@5.1.0 - Web framework
  - cors@2.8.5 - CORS middleware

- Development:
  - nodemon@3.1.10 - Auto-reload development server
  - jest@29.7.0 - Testing framework
  - supertest@6.3.4 - HTTP testing
  - eslint@8.56.0 - Code linting

### 2. Frontend Setup
Navigate to frontend directory and install dependencies:
```powershell
cd ../frontend
npm install
```

**Frontend Dependencies:**
- Development:
  - serve@14.2.1 - Static file server

## Running the Application

### 1. Start Backend Server
```powershell
cd backend
npm run dev
```
Backend will run on: http://localhost:4000

### 2. Start Frontend Server
In a new terminal:
```powershell
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000 (or another port if 3000 is in use)

## Development Tools

### 1. ESLint Configuration
The project uses ESLint for code quality. Configuration is in `.eslintrc.json`.

### 2. Testing Setup
Jest configuration is in `jest.config.json`. Run tests with:
```powershell
cd backend
npm test
```

### 3. GitHub Copilot Usage
1. Enable Copilot in VS Code:
   - Press `Ctrl+Shift+P`
   - Type "GitHub Copilot: Enable"
   - Select to enable

2. Using Copilot:
   - Press `Alt+[` or `Alt+]` to cycle through suggestions
   - Press `Tab` to accept suggestions
   - Use `Ctrl+Enter` to see more suggestions

## Verification Steps

1. **Check Backend:**
   - Open http://localhost:4000/tasks in browser
   - Should see: `[]` or existing tasks

2. **Check Frontend:**
   - Open http://localhost:3000 (or assigned port)
   - Should see the task manager interface

3. **Test API:**
   - Create a task
   - View tasks list
   - Update a task
   - Delete a task

## Troubleshooting

1. **Port Conflicts**
   - If port 3000 is in use, frontend will auto-assign new port
   - If port 4000 is in use, modify in backend/index.js

2. **Node Version Issues**
   ```powershell
   nvm install 14
   nvm use 14
   ```

3. **Dependencies Issues**
   ```powershell
   rm -r node_modules
   npm cache clean --force
   npm install
   ```

## Additional Resources

- Express.js Documentation: https://expressjs.com/
- Jest Documentation: https://jestjs.io/
- GitHub Copilot Docs: https://docs.github.com/en/copilot