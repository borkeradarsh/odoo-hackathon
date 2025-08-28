# Docker Commands

## Build the Docker image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
  -t gg-todo:latest .

## Run the Docker container
docker run \
  -p 3000:3000 \
  --name gg-todo-container \
  -e NODE_ENV=production \
  gg-todo:latest

## Development with environment file
# Create a .env.docker file with your Supabase credentials
# Then build and run with:
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2) \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2) \
  -t gg-todo:latest .

## Stop and remove container
docker stop gg-todo-container
docker rm gg-todo-container

## View logs
docker logs gg-todo-container

## Access running container
docker exec -it gg-todo-container sh

## Clean up unused images
docker image prune -f

## Build for different platforms (if needed for deployment)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
  -t gg-todo:latest \
  --push .
