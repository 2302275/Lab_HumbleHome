FROM node:18

# Create the www-data user if it doesn't already exist (www-data group apparently already exists in the node image)
# Ensures that if the www-data user already exists, it won't throw an error and will simply skip that step
RUN useradd -r -g www-data www-data || true 

# Set the working directory
WORKDIR /app

# Copy the package files
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Expose the port
EXPOSE 3000

# Copy the rest of the application
COPY . .

# # Change ownership of the application files to the www-data user
# RUN chown -R www-data:www-data /app

# # Switch to the www-data user
# USER www-data

# Run the application
CMD ["npm", "start"]
