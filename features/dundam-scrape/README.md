https://dundam.xyz/

딜러 URL

GET: https://dundam.xyz/damage_ranking?page=1&type=7&job={각성이름}&baseJob={직업이름}&weaponType=전체&weaponDetail=전체
  - Dunfaoff 같은 줄 알았지만 아님.

POST: https://dundam.xyz/dat/dealerRankingData.jsp?page=1&job={각성이름}&baseJob={직업이름}&weaponType=전체&type=7&weaponDetail=전체

직업이름 = {직업이름} + "(" + {성별} + ")"
  - 외전 캐릭터(다크나이트, 크리에이터)는 직업이름이 "외전"

각성이름 = "眞 " + {직업이름}

예) 귀검사(남), 眞 웨펀마스터
예) 외전, 眞 크리에이터

한마디로 직업이름, 각성이름 둘다 웹사이트에서 보이는대로. 참고로 다크나이트, 크리에이터는 `眞` 이런거 없고 그냥 `자각2`다.

type
  - 7: 랭킹 순위
  - 8: 명성
  - 9: 전 직업 명성

`page=n`은 1부터 증가

"배틀 버퍼"도 이곳에서 조회 가능

예) https://dundam.xyz/damage_ranking?page=1&type=7&job=眞%20버서커&baseJob=귀검사(남)&weaponType=전체&weaponDetail=전체

버퍼 URL

GET: https://dundam.xyz/buff_ranking?page=5&type=1&job=1&favor=2
  - Dunfaoff 같은 줄 알았지만 아님

POST: https://dundam.xyz/dat/bufferRankingData.jsp?page=5&type=1&job=1&favor=2

그냥 이대로가 전체 (남크, 여크, 븜크)
  - 하지만 필요한것은 각 직업마다 N캐릭터에 대한 탈리스만, 룬, 스킬 트리 참고. 전체 캐릭터 순위가 필요한것이 아님

`page=n` 이것만 1부터 증가

type
  - 1: 스탯
  - 2: 공격력
  - 3: 점수

job
  - 1: 전체
  - 2: 여크
  - 3: 남크
  - 4: 븜크

favor
  - 1: 편애 ON (븜크 버프력이 더 올라감)
  - 2: 편애 OFF