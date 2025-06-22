# Frontend Integration Guide

## Authentication

### JWT Authentication
- All API requests (except public endpoints) require a JWT token in the `Authorization` header
- Format: `Bearer <token>`
- Token is obtained after login/authentication with Spotify

## Socket.IO Integration

### Connection
```javascript
// Connect to socket server with token
const socket = io('http://server-url', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for connection events
socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Socket Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `conversationId: string` | Join a conversation room |
| `leave_conversation` | `conversationId: string` | Leave a conversation room |
| `new_message` | `{ conversationId: string, content: string, messageType?: 'text'\|'image'\|'file'\|'spotify_track', spotifyData?: object }` | Send a message to a conversation |
| `read_message` | `{ messageId: string, conversationId: string }` | Mark message as read |
| `typing` | `{ conversationId: string }` | Indicate user is typing |
| `stop_typing` | `{ conversationId: string }` | Indicate user stopped typing |

### Socket Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ userId: string }` | Connected to socket server |
| `conversations` | `Array<Conversation>` | List of user conversations |
| `new_message` | `Message` | New message received |
| `message_delivered` | `{ messageId: string, deliveredAt: Date }` | Message delivered status |
| `message_read` | `{ messageId: string, readAt: Date, readBy: string }` | Message read status |
| `user_typing` | `{ userId: string, conversationId: string }` | User is typing |
| `user_stop_typing` | `{ userId: string, conversationId: string }` | User stopped typing |
| `user_online` | `{ userId: string, timestamp: Date }` | User came online |
| `user_offline` | `{ userId: string, timestamp: Date }` | User went offline |

## REST API Endpoints

### Authentication

#### Login with Spotify
- **URL**: `/auth/spotify`
- **Method**: `GET`
- **Response**: Redirects to Spotify OAuth

#### Spotify Callback
- **URL**: `/auth/callback`
- **Method**: `GET`
- **Response**: 
  ```json
  {
    "token": "jwt-token",
    "user": {}
  }
  ```

### User Profile

#### Get Profile
- **URL**: `/api/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "user": {
      "_id": "string",
      "spotifyId": "string",
      "username": "string",
      "displayName": "string",
      "profilePicture": "string",
      "bio": "string",
      "age": "number",
      "gender": "string",
      "intrestedIn": ["string"],
      "city": "string",
      "country": "string",
      "isOnline": "boolean",
      "lastSeen": "Date",
      "musicProfile": {}
    }
  }
  ```

#### Set Username
- **URL**: `/api/setUsername`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Username updated successfully"
  }
  ```

### Friends

#### Get Friends
- **URL**: `/api/friends`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "friends": [
      {
        "_id": "string",
        "username": "string",
        "displayName": "string",
        "profilePicture": "string",
        "isOnline": "boolean",
        "lastSeen": "Date"
      }
    ]
  }
  ```

#### Send Friend Request
- **URL**: `/api/friendRequest`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "receiverId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Friend request sent"
  }
  ```

#### Get Friend Requests
- **URL**: `/api/friendRequests`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "incoming": [
      {
        "_id": "string",
        "senderId": "string",
        "status": "pending",
        "createdAt": "Date",
        "sender": {
          "_id": "string",
          "username": "string",
          "displayName": "string",
          "profilePicture": "string"
        }
      }
    ],
    "outgoing": []
  }
  ```

#### Accept Friend Request
- **URL**: `/api/acceptFriendRequest`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "requestId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Friend request accepted"
  }
  ```

#### Reject Friend Request
- **URL**: `/api/rejectFriendRequest`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "requestId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Friend request rejected"
  }
  ```

#### Remove Friend
- **URL**: `/api/removeFriend`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "friendId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Friend removed"
  }
  ```

### Chat

#### Get Conversations
- **URL**: `/api/chats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "conversations": [
      {
        "_id": "string",
        "participants": ["string"],
        "lastMessage": {
          "content": "string",
          "senderId": "string",
          "createdAt": "Date"
        },
        "lastActivity": "Date",
        "unreadCount": 0
      }
    ]
  }
  ```

#### Get Single Conversation
- **URL**: `/api/chat/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "conversation": {
      "_id": "string",
      "participants": ["string"],
      "messages": [
        {
          "_id": "string",
          "senderId": "string",
          "content": "string",
          "messageType": "text",
          "createdAt": "Date",
          "isRead": "boolean",
          "readAt": "Date"
        }
      ]
    }
  }
  ```

#### Get Messages
- **URL**: `/api/messages/:conversationId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `?page=1&limit=50`
- **Response**:
  ```json
  {
    "messages": [
      {
        "_id": "string",
        "senderId": "string",
        "content": "string",
        "messageType": "text",
        "createdAt": "Date",
        "isRead": "boolean",
        "readAt": "Date"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalPages": 1,
      "totalMessages": 10
    }
  }
  ```

### User Search

#### Search Users
- **URL**: `/api/users/search`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `?query=username`
- **Response**:
  ```json
  {
    "users": [
      {
        "_id": "string",
        "username": "string",
        "displayName": "string",
        "profilePicture": "string"
      }
    ]
  }
  ```

### Onboarding

#### Check Onboarding Status
- **URL**: `/api/checkOnboarding`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "hasCompletedOnboarding": "boolean"
  }
  ```

## Data Structures

### User
```typescript
interface User {
  _id: string;
  spotifyId: string;
  username?: string;
  displayName: string;
  firstName: string;
  lastName?: string;
  profilePicture: string;
  bio: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  intrestedIn: ('male' | 'female' | 'non-binary' | 'other')[];
  city: string;
  spotifyFollowers: number;
  country: string;
  isActive: boolean;
  isOnline: boolean;
  lastSeen: Date;
  hasCompletedOnboarding: boolean;
}
```

### Message
```typescript
interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'playlist' | 'system';
  sharedContent?: {
    type: 'track' | 'playlist';
    spotifyId: string;
    data: any;
  };
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  sentAt: Date;
}
```

### Conversation
```typescript
interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
  messageCount: {
    [userId: string]: number;
  };
  isActive: boolean;
  sharedTracks: any[];
}
```

## Error Handling

All API endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": {} // Optional error details
}
```

HTTP Status codes:
- 200: Success
- 400: Bad request (client error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error

Socket errors are emitted as an 'error' event with a message object. 