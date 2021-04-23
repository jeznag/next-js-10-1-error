FROM node:14-alpine

# Build-time env variables for the client
ARG NEXT_PUBLIC_MOBILE_VERSION
ENV NEXT_PUBLIC_MOBILE_VERSION=$NEXT_PUBLIC_MOBILE_VERSION

# Create src directory and copy all project files
WORKDIR /src

# Copy the whole monorepo
COPY . .

# Remove harvest desktop codebase
RUN rm -rf /desktop

# Install dependancies
RUN yarn

# Build typescript project
RUN yarn mobile build

# Expose server ports
EXPOSE 3000

# Specify default CMD
CMD ["yarn", "mobile", "start"]
