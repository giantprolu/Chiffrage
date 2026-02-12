GET /api/entries?month=2&year=2026 200 in 224ms (compile: 28ms, proxy.ts: 9ms, render: 186ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-02-01T00:00:00.000Z"),
            lt: new Date("2026-03-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=2&year=2026 500 in 569ms (compile: 110ms, proxy.ts: 7ms, render: 452ms)
 GET /api/conge-days?month=2&year=2026 200 in 572ms (compile: 193ms, proxy.ts: 7ms, render: 372ms)
 GET /api/entries?month=2&year=2026 200 in 61ms (compile: 16ms, proxy.ts: 8ms, render: 37ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-02-01T00:00:00.000Z"),
            lt: new Date("2026-03-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=2&year=2026 500 in 197ms (compile: 25ms, proxy.ts: 7ms, render: 165ms)
 GET /api/conge-days?month=2&year=2026 200 in 197ms (compile: 33ms, proxy.ts: 8ms, render: 156ms)
 GET /api/entries?month=3&year=2026 200 in 57ms (compile: 17ms, proxy.ts: 8ms, render: 32ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-03-01T00:00:00.000Z"),
            lt: new Date("2026-04-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=3&year=2026 500 in 192ms (compile: 26ms, proxy.ts: 8ms, render: 158ms)
 GET /api/conge-days?month=3&year=2026 200 in 191ms (compile: 35ms, proxy.ts: 8ms, render: 148ms)
 GET /api/entries?month=4&year=2026 200 in 51ms (compile: 11ms, proxy.ts: 6ms, render: 34ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-04-01T00:00:00.000Z"),
            lt: new Date("2026-05-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=4&year=2026 500 in 184ms (compile: 19ms, proxy.ts: 6ms, render: 160ms)
 GET /api/conge-days?month=4&year=2026 200 in 185ms (compile: 28ms, proxy.ts: 6ms, render: 151ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-05-01T00:00:00.000Z"),
            lt: new Date("2026-06-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=5&year=2026 500 in 181ms (compile: 22ms, proxy.ts: 7ms, render: 153ms)
 GET /api/entries?month=5&year=2026 200 in 185ms (compile: 13ms, proxy.ts: 6ms, render: 166ms)
 GET /api/conge-days?month=5&year=2026 200 in 184ms (compile: 31ms, proxy.ts: 7ms, render: 146ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-04-01T00:00:00.000Z"),
            lt: new Date("2026-05-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=4&year=2026 500 in 229ms (compile: 23ms, proxy.ts: 10ms, render: 197ms)
 GET /api/entries?month=4&year=2026 200 in 238ms (compile: 12ms, proxy.ts: 14ms, render: 212ms)
 GET /api/conge-days?month=4&year=2026 200 in 231ms (compile: 33ms, proxy.ts: 8ms, render: 189ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-03-01T00:00:00.000Z"),
            lt: new Date("2026-04-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=3&year=2026 500 in 186ms (compile: 20ms, proxy.ts: 7ms, render: 159ms)
 GET /api/entries?month=3&year=2026 200 in 193ms (compile: 10ms, proxy.ts: 10ms, render: 173ms)
 GET /api/conge-days?month=3&year=2026 200 in 190ms (compile: 31ms, proxy.ts: 7ms, render: 152ms)
 GET /api/entries?month=2&year=2026 200 in 50ms (compile: 9ms, proxy.ts: 6ms, render: 34ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-02-01T00:00:00.000Z"),
            lt: new Date("2026-03-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=2&year=2026 500 in 180ms (compile: 19ms, proxy.ts: 6ms, render: 155ms)
 GET /api/conge-days?month=2&year=2026 200 in 180ms (compile: 30ms, proxy.ts: 6ms, render: 145ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-03-01T00:00:00.000Z"),
            lt: new Date("2026-04-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=3&year=2026 500 in 175ms (compile: 20ms, proxy.ts: 6ms, render: 148ms)
 GET /api/entries?month=3&year=2026 200 in 179ms (compile: 11ms, proxy.ts: 6ms, render: 162ms)
 GET /api/conge-days?month=3&year=2026 200 in 179ms (compile: 30ms, proxy.ts: 6ms, render: 143ms)
 GET /api/entries?month=4&year=2026 200 in 60ms (compile: 10ms, proxy.ts: 8ms, render: 42ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-04-01T00:00:00.000Z"),
            lt: new Date("2026-05-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=4&year=2026 500 in 209ms (compile: 19ms, proxy.ts: 7ms, render: 183ms)
 GET /api/conge-days?month=4&year=2026 200 in 209ms (compile: 27ms, proxy.ts: 6ms, render: 175ms)
 GET /api/entries?month=5&year=2026 200 in 53ms (compile: 14ms, proxy.ts: 6ms, render: 32ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-05-01T00:00:00.000Z"),
            lt: new Date("2026-06-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=5&year=2026 500 in 181ms (compile: 24ms, proxy.ts: 6ms, render: 151ms)
 GET /api/conge-days?month=5&year=2026 200 in 181ms (compile: 30ms, proxy.ts: 9ms, render: 142ms)
 GET /api/entries?month=4&year=2026 200 in 54ms (compile: 9ms, proxy.ts: 11ms, render: 34ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-04-01T00:00:00.000Z"),
            lt: new Date("2026-05-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=4&year=2026 500 in 197ms (compile: 20ms, proxy.ts: 7ms, render: 170ms)
 GET /api/conge-days?month=4&year=2026 200 in 198ms (compile: 30ms, proxy.ts: 6ms, render: 161ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-03-01T00:00:00.000Z"),
            lt: new Date("2026-04-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=3&year=2026 500 in 176ms (compile: 22ms, proxy.ts: 6ms, render: 148ms)
 GET /api/entries?month=3&year=2026 200 in 181ms (compile: 12ms, proxy.ts: 7ms, render: 162ms)
 GET /api/conge-days?month=3&year=2026 200 in 180ms (compile: 32ms, proxy.ts: 5ms, render: 143ms)
 GET /import 200 in 76ms (compile: 12ms, proxy.ts: 10ms, render: 54ms)
 GET /api/auth/me 200 in 25ms (compile: 9ms, proxy.ts: 6ms, render: 11ms)
 GET /export 200 in 168ms (compile: 140ms, proxy.ts: 3ms, render: 25ms)
 GET /api/auth/me 200 in 22ms (compile: 8ms, proxy.ts: 5ms, render: 9ms)
 GET /stats 200 in 148ms (compile: 116ms, proxy.ts: 3ms, render: 29ms)
 GET /api/auth/me 200 in 32ms (compile: 9ms, proxy.ts: 7ms, render: 16ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__8142b190._.js:204:168

  201 } : {
  202     userId
  203 };
→ 204 const formationDays = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2025-09-01T00:00:00.000Z"),
            lte: new Date("2026-08-31T23:59:59.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\stats\route.ts:45:51)
    at async GET (app\api\stats\route.ts:45:25)
  43 |       ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }       
  44 |       : { userId };
> 45 |   const formationDays = await prisma.formationDay.findMany({
     |                                                   ^
  46 |     where: formationWhere,
  47 |   });
  48 | {
  clientVersion: '6.19.2'
}
 GET /api/stats?from=2025-09-01&to=2026-08-31 500 in 301ms (compile: 88ms, proxy.ts: 7ms, render: 207ms)
 GET / 200 in 74ms (compile: 15ms, proxy.ts: 8ms, render: 52ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__8142b190._.js:204:168

  201 } : {
  202     userId
  203 };
→ 204 const formationDays = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2025-09-01T00:00:00.000Z"),
            lte: new Date("2026-08-31T23:59:59.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\stats\route.ts:45:51)
    at async GET (app\api\stats\route.ts:45:25)
  43 |       ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }       
  44 |       : { userId };
> 45 |   const formationDays = await prisma.formationDay.findMany({
     |                                                   ^
  46 |     where: formationWhere,
  47 |   });
  48 | {
  clientVersion: '6.19.2'
}
 GET /api/stats?from=2025-09-01&to=2026-08-31 500 in 269ms (compile: 53ms, proxy.ts: 9ms, render: 207ms)
 GET /api/entries?month=2&year=2026 200 in 58ms (compile: 13ms, proxy.ts: 7ms, render: 37ms)
 GET /api/auth/me 200 in 62ms (compile: 24ms, proxy.ts: 8ms, render: 30ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-02-01T00:00:00.000Z"),
            lt: new Date("2026-03-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=2&year=2026 500 in 180ms (compile: 31ms, proxy.ts: 7ms, render: 141ms)
 GET /api/conge-days?month=2&year=2026 200 in 180ms (compile: 39ms, proxy.ts: 7ms, render: 134ms)
 GET /api/entries?month=2&year=2026 200 in 48ms (compile: 9ms, proxy.ts: 14ms, render: 25ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__ce3a9b74._.js:174:159

  171 }
  172 const startDate = new Date(Date.UTC(year, month - 1, 1));
  173 const endDate = new Date(Date.UTC(year, month, 1));
→ 174 const days = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2026-02-01T00:00:00.000Z"),
            lt: new Date("2026-03-01T00:00:00.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        },
        orderBy: {
          date: "asc"
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\formation-days\route.ts:22:42)
    at async GET (app\api\formation-days\route.ts:22:16)
  20 |   const endDate = new Date(Date.UTC(year, month, 1));
  21 |
> 22 |   const days = await prisma.formationDay.findMany({
     |                                          ^
  23 |     where: {
  24 |       date: { gte: startDate, lt: endDate },
  25 |       userId, {
  clientVersion: '6.19.2'
}
 GET /api/formation-days?month=2&year=2026 500 in 182ms (compile: 14ms, proxy.ts: 7ms, render: 161ms)
 GET /api/conge-days?month=2&year=2026 200 in 182ms (compile: 25ms, proxy.ts: 6ms, render: 151ms)
 GET /stats 200 in 39ms (compile: 8ms, proxy.ts: 7ms, render: 23ms)
 GET /api/auth/me 200 in 32ms (compile: 7ms, proxy.ts: 7ms, render: 18ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__8142b190._.js:204:168

  201 } : {
  202     userId
  203 };
→ 204 const formationDays = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2025-09-01T00:00:00.000Z"),
            lte: new Date("2026-08-31T23:59:59.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\stats\route.ts:45:51)
    at async GET (app\api\stats\route.ts:45:25)
  43 |       ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }       
  44 |       : { userId };
> 45 |   const formationDays = await prisma.formationDay.findMany({
     |                                                   ^
  46 |     where: formationWhere,
  47 |   });
  48 | {
  clientVersion: '6.19.2'
}
 GET /api/stats?from=2025-09-01&to=2026-08-31 500 in 160ms (compile: 15ms, proxy.ts: 6ms, render: 139ms)
⨯ Error [PrismaClientValidationError]: 
Invalid `{imported module ./lib/prisma.ts}["prisma"].formationDay.findMany()` invocation in
C:\Users\nathan.chavaudra\OneDrive - Magellan Partners\Bureau\Perso\chiffrage\.next\dev\server\chunks\[root-of-the-server]__8142b190._.js:204:168

  201 } : {
  202     userId
  203 };
→ 204 const formationDays = await {imported module ./lib/prisma.ts}["prisma"].formationDay.findMany({
        where: {
          date: {
            gte: new Date("2025-09-01T00:00:00.000Z"),
            lte: new Date("2026-08-31T23:59:59.000Z")
          },
          userId: 1,
          ~~~~~~
      ?   AND?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   OR?: FormationDayWhereInput[],
      ?   NOT?: FormationDayWhereInput | FormationDayWhereInput[],
      ?   id?: IntFilter | Int,
      ?   label?: StringFilter | String
        }
      })

Unknown argument `userId`. Available options are marked with ?.
    at <unknown> (app\api\stats\route.ts:45:51)
    at async GET (app\api\stats\route.ts:45:25)
  43 |       ? { date: { gte: new Date(from + "T00:00:00Z"), lte: new Date(to + "T23:59:59Z") }, userId }       
  44 |       : { userId };
> 45 |   const formationDays = await prisma.formationDay.findMany({
     |                                                   ^
  46 |     where: formationWhere,
  47 |   });
  48 | {
  clientVersion: '6.19.2'
}
 GET /api/stats?from=2025-09-01&to=2026-08-31 500 in 152ms (compile: 5ms, proxy.ts: 3ms, render: 143ms)