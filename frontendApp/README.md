# Document Management System - Frontend

A modern, feature-rich document management system built with React and connected to a Node.js backend.

## Features

### 🔐 User Authentication
- User registration with email
- Login with email/password
- Forgot password functionality with email reset
- JWT-based authentication

### 📄 Document Management
- **Document Listing**: Display all accessible documents with metadata
- **Document Creation**: Rich WYSIWYG editor for creating formatted documents
- **Document Editing**: In-place editing with auto-save functionality
- **Search Functionality**: Global search across document titles and content

### 👥 User Collaboration
- **User Mentions**: @username functionality that triggers notifications
- **Auto-sharing**: When a user is mentioned, they automatically get read access

### 🔒 Privacy Controls
- **Public Documents**: Accessible to anyone with the link
- **Private Documents**: Only accessible to the author and explicitly shared users
- **Sharing Management**: Add/remove user access with different permission levels

### 📚 Version Control & History
- Track all document changes with timestamps
- Display version history with ability to view previous versions
- Show who made changes and when
- Compare versions (basic diff view)

## Tech Stack

- **Frontend**: React 19, Vite
- **UI Components**: Custom CSS with modern design
- **Rich Text Editor**: React Quill
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 3000

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx
│   ├── documents/
│   │   ├── DocumentList.jsx
│   │   └── DocumentEditor.jsx
│   └── layout/
│       └── Navbar.jsx
├── App.jsx
├── App.css
└── index.js
```

## API Endpoints

The frontend connects to the following backend endpoints:

### Authentication
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `POST /api/user/forgot-password` - Forgot password
- `POST /api/user/reset-password/:token` - Reset password

### Documents
- `GET /api/document/list` - List documents
- `GET /api/document/search` - Search documents
- `POST /api/document/create` - Create document
- `PATCH /api/document/edit/:id` - Edit document
- `POST /api/document/share/:id` - Share document
- `DELETE /api/document/share/:id/:userId` - Remove sharing
- `GET /api/document/versions/:id` - Get version history
- `POST /api/document/mention/:id` - Mention user

### User
- `GET /api/user/notifications/:userId` - Get notifications
- `GET /api/user/shared-docs/:userId` - Get shared documents

## Key Features Explained

### Auto-Save
Documents automatically save after 3 seconds of inactivity, ensuring no work is lost.

### Rich Text Editor
Powered by React Quill, providing:
- Text formatting (bold, italic, underline)
- Headers and lists
- Text alignment
- Color and background options
- Links and images

### Real-time Collaboration
- Share documents with specific users
- Set view/edit permissions
- Mention users with @username
- Automatic notifications

### Version Control
- Automatic version tracking on each save
- View complete version history
- Restore previous versions
- See who made changes and when

## Styling

The application uses a modern, responsive design with:
- Gradient backgrounds
- Card-based layouts
- Smooth animations and transitions
- Mobile-responsive design
- Consistent color scheme

## Development

### Adding New Features
1. Create new components in the appropriate directory
2. Add routes in `App.jsx`
3. Update the navbar if needed
4. Add corresponding API calls

### Styling Guidelines
- Use the existing CSS classes for consistency
- Follow the established color scheme
- Ensure mobile responsiveness
- Use Lucide React icons for consistency

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the backend server is running on port 3000
   - Check the proxy configuration in `vite.config.js`

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check if the JWT token is valid

3. **Auto-save Not Working**
   - Check browser console for errors
   - Ensure the document has a title

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
