# Use an official Node.js image
FROM node:22-alpine



WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of your app's source code
COPY . .

RUN npm run build
# Expose the port your app runs on (change if needed)
EXPOSE 3000

# Run your app
CMD ["npm", "start"]
