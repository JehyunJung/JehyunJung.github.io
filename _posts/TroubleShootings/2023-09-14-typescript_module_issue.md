---
title: "Typescript Module Issue"
excerpt: "Typescript 실행 시 module을 인식하지 못하는 문제"

categories:
  - Trouble_Shooting
tags:
  - javascript
  - typescript
  - troubleshooting
---

# JTypescript Module Issue

## 에러 내용

```
node_modules/@types/lodash/common/lang.d.ts:576:24 - error TS2583: Cannot find name 'Map'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

576         isEmpty(value: Map<any, any> | Set<any> | List<any> | null | undefined): boolean;
                           ~~~

node_modules/@types/lodash/common/lang.d.ts:576:40 - error TS2583: Cannot find name 'Set'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

576         isEmpty(value: Map<any, any> | Set<any> | List<any> | null | undefined): boolean;
                                           ~~~

node_modules/@types/lodash/common/lang.d.ts:833:38 - error TS2583: Cannot find name 'Map'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

833         isMap(value?: any): value is Map<any, any>;
                                         ~~~

node_modules/@types/lodash/common/lang.d.ts:1208:38 - error TS2583: Cannot find name 'Set'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

1208         isSet(value?: any): value is Set<any>;
                                          ~~~

node_modules/@types/lodash/common/lang.d.ts:1326:42 - error TS2583: Cannot find name 'WeakMap'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

1326         isWeakMap(value?: any): value is WeakMap<object, any>;
                                              ~~~~~~~

node_modules/@types/lodash/common/lang.d.ts:1348:42 - error TS2583: Cannot find name 'WeakSet'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.

1348         isWeakSet(value?: any): value is WeakSet<object>;
                                              ~~~~~~~


Found 6 errors in the same file, starting at: node_modules/@types/lodash/common/lang.d.ts:576

```

## 에러 원인

특정 모듈이 이미 설치된 상황에서 위와 같은 문제가 발생하게 된다면 @types/node module이 설치되어 있는지 확인해야한다.

## 에러 해결방법
 
아래와 같이 간단하게 모듈만 추가적으로 설치하면 문제를 쉽게 해결할 수 있다.

```sh
npm i @types/node
```

>Typescript 기본 개발환경 구축하기

Node.js 환경에서 Typescript 개발을 위해서는 typescript, ts-node, @types/node 모듈의 설치가 필수적이다.

|Modules|Description|
|--|--|
|TypeScript|타입스크립트 컴파일러|
|ts-node|tsc을 이용해서 TS->JS 변환이 가능하지만 실행은 별도로 처리해야한다. ts-node을 활용하면 변환+실행을 동시에 처리 가능하다.|
|@types/node|타입스크립트에서 노드 모듈을 사용할 수 있도록 하기 위함, 노드 모듈을 타입스크립트 기반으로 처리한 모듈|

