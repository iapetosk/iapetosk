
# Instruction

*Imouto Material* is highly module driven downloader, written in *typescript*, and favoured by *nw.js*.<br>
It's motivated by how my previous project lack in downloader features.<br>

# Installation

```bash
git clone https://github.com/Sombian/imouto-material.git
cd imouto-material
npm install
npm run serve
```

# Documentation

## configure.ts

> provides confugrations favoured by *storage.ts*.<br>

```ts
WIP
```
## download.ts

> provides downloader favoured by *storage.ts*, and *request.ts*.<br>

```ts
/**
 * start download. if max_thread is exceeded, given thread will be queued. 
 */
public create(thread: Thread): Promise<void>
/**
 * remove downloaded files and thread data.
 */
public remove(id: number): Promise<void>
/**
 * evaluate link and form it into thread.
 */
public evaluate(link: string): Promise<Thread> 
```

## listener.js

> provides event-listener across the modules.<br>

```ts
WIP
```

## request.ts

> provides *http* / *https* request and file write.<br>

```ts
/**
 * send and retrive data.
 */
public async send(options: RequestOptions, file?: File): Promise<{ content: { buffer: Buffer, encode: string; }, status: { code?: number, message?: string; }; }>
```

## storage.ts

> provides storage system in *json* format.<br>

```ts
WIP
```

## utility.ts

> provides useful functions in many cases.<br>

```ts
WIP
```
