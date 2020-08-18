
# Instruction

*Blossom* is highly module driven downloader, written in *typescript*, and favoured by *nw.js*.<br>
It's motivated by how my previous project lack in downloader features.<br>

# Installation

```bash
git clone https://github.com/Sombian/blossom.git
cd blossom
npm install
npm run serve
```

# Documentation

## configure.ts

> features confugrations favoured by *storage.ts*.<br>

```ts
WIP
```

## download.ts

> features downloader favoured by *storage.ts*, and *request.ts*.<br>

```ts
/**
 * start download. if max_thread is exceeded, given thread will be queued. 
 */
public start(thread: Thread): Promise<void>
/**
 * evaluate link and form it into thread.
 */
public modulator(link: string): Promise<Thread> 
```

## listener.js

> features event-listener across the modules.<br>

```ts
WIP
```

## request.ts

> features *http* / *https* request and file write.<br>

```ts
/**
 * send and retrive data.
 */
public async send(options: RequestOptions, file?: File): Promise<{ content: { buffer: Buffer, encode: string; }, status: { code?: number, message?: string; }; }>
```

## storage.ts

> features storage system in *json* format.<br>

```ts
WIP
```

## utility.ts

> features useful functions in many cases.<br>

```ts
WIP
```
