# Docker Commands

## PowerShell Commands (Windows)

### Build the Docker image
```powershell
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key -t gg-todo:latest .
```

### Run the Docker container
```powershell
docker run -p 3000:3000 --name gg-todo-container -e NODE_ENV=production gg-todo:latest
```

### Build with environment variables from .env.local
```powershell
$env:SUPABASE_URL = (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_URL").Line.Split("=")[1]
$env:SUPABASE_KEY = (Get-Content .env.local | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY").Line.Split("=")[1]
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=$env:SUPABASE_URL --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:SUPABASE_KEY -t gg-todo:latest .
```

## Bash Commands (Linux/macOS)

### Build the Docker image
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
  -t gg-todo:latest .
```

### Run the Docker container
```bash
docker run \
  -p 3000:3000 \
  --name gg-todo-container \
  -e NODE_ENV=production \
  gg-todo:latest
```

### Development with environment file
```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2) \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2) \
  -t gg-todo:latest .
```

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
