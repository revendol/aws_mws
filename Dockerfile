ARG NODE_VERSION=20.3.1
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app
# Add package file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build TypeScript files
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Command to run your app using node
CMD ["npm", "start"]