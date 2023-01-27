던파 API 페이지 (네오플): https://developers.neople.co.kr/contents/apiDocs/df

`cred/api.txt` 파일 만들고 API키 복붙

`features/get-df-jobs.ts` 실행하면 만들어지는 `data/df-jobs.json` 등 파일 생성

```
npm run ts-node -- features\get-df-jobs.ts
```

---

던담에서 1000위 까지만 보더라도 10증폭에 융합끼고 있음. 고인물...이 너무 많음.

네오플 던파API 허용량(+ 무조건 증설 2회) ([링크](https://developers.neople.co.kr/contents/guide/pages/all#api-%EA%B5%AC%EC%84%B1)):

  - 1초: 10->50->100건
  - 1분: 600->3000->6000건
  - 1시간: 36,000->180,000->360,000건

그래도 증설하면 감당될만함.

---

2023-01-27 12:40 `master 5a0b738` 부로 '검신/眞 웨펀마스터' 마지막 페이지:

  - 던담: 4874
  - 던옾: 6768

4.8만 혹은 6.7만...

아직 모든 직업군당 마지막 페이지 찾아보진 못했음.