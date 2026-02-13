# 🧾 TrustFund — 온체인 기반 크라우드 펀딩 시스템

> 크라우드 펀딩의 신뢰 문제(자금 사용처 검증 어려움, 유용/중단 시 대응 어려움)를 해결하기 위해  
> **펀딩 핵심 이벤트를 온체인 기록**하고, **컨트랙트가 자금을 보관**하며,  
> **마일스톤 완료 요청 → 후원자 투표 → 과반 승인 시 단계적 집행 / 아니면 환불** 흐름을 제공하는 프로젝트입니다.

<br />

<!-- 배지(원하는 것만 남기고 수정해서 사용하세요) -->
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)


![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFF100?logo=ethereum&logoColor=black)

![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

<br />

## 📚 프로젝트 소개

**TrustFund**는 펀딩 과정의 신뢰를 높이기 위해 다음을 구현했습니다.

- 펀딩의 주요 이벤트(생성/입금/요청/투표/집행)를 **온체인에 기록**
- 후원금은 컨트랙트가 보관하는 **자금 잠금 구조**
- **마일스톤 기반**으로 자금 집행:
  - 창작자가 마일스톤 완료 요청
  - 후원자가 투표
  - 과반 승인 시 **일부 자금 단계적 집행**
  - 거부/기간 만료/조건 불충족 시 **환불 흐름 제공**

<br />

## 🖼️ 화면 미리보기

<img width="300" alt="image" src="https://github.com/user-attachments/assets/a0a7f2f7-a73c-4eda-a698-b7762e160388" />


<img width="610"  alt="image" src="https://github.com/user-attachments/assets/29058142-9b7d-496b-b10a-2360bcf23fa1" />

<img width="1209" height="884" alt="image" src="https://github.com/user-attachments/assets/ca6c4f92-6b5c-44a6-9d04-6ee205022f70" />


<br />

## 🧩 배경 및 목표

### 문제의식

크라우드 펀딩에서 가장 큰 불신 요인은 다음과 같습니다.

1. **모금액이 실제로 어디에 쓰이는지 검증이 어렵다**
2. 중간에 **자금이 유용되거나** 프로젝트가 중단되는 경우에도
   후원자가 대응하기 어렵다

### 목표

- **핵심 이벤트를 온체인으로 기록**하여 투명성 강화
- **컨트랙트 에스크로**로 자금 임의 인출 방지
- **마일스톤 단위 집행 + 후원자 투표**로 거버넌스 제공

<br />

## 👥 서비스 플로우

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1fd224c5-eaaf-46e4-a84c-a7d45b59e24d" />


1. **프로젝트 등록** (창작자)
2. **후원금 예치** (후원자)
   - 프로젝트별 후원금 기록
3. **펀딩 목표 달성 → 자금 잠금(컨트랙트 보관)**
   - 창작자는 임의 인출 불가
4. **마일스톤 완료 요청** (창작자)
5. **후원자 투표 (온체인 기록)**
6. 결과에 따라
   - ✅ **과반 승인 → 자금 일부 송금(단계적 집행)**
   - ❌ **조건 불충족/거부/기간 만료 → 환불**

<br />


## 🏗️ 아키텍처



### 구성 요소

- **Frontend**: Next.js + TypeScript, Vercel 배포
- **Auth**: Web3Auth 기반 인증
- **Backend**: AWS EC2(Node, Docker), Caddy로 HTTPS + Reverse Proxy
- **DB**: MongoDB Cluster
- **IPFS**: Pinata (파일 업로드, CID 반환)
- **Smart Contract**: Solidity + Hardhat (이더리움 네트워크 배포, Etherscan Verified)

### 데이터/요청 흐름 요약

- 사용자는 웹에서 서비스 접속 → 프론트에서 인증(Web3Auth) 및 트랜잭션 요청
- 백엔드는 이미지 파일 업로드를 Pinata로 전달 → **CID 수신** → DB 저장
- 스마트 컨트랙트는 펀딩/투표/집행 상태를 온체인으로 관리

<br />

## ✨ 핵심 설계

## ✅ 온체인 이벤트 설계

펀딩의 신뢰를 위해 다음과 같은 핵심 이벤트를 온체인에 기록하도록 설계했습니다.

- 프로젝트 생성
- 후원(입금)
- 마일스톤 완료 요청
- 후원자 투표
- 자금 집행(단계적 지급) / 환불

<br />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d1943832-e928-4413-8f47-a18097d6ddcd" />

## 🔐 Auth 설계 (Web3Auth)

### 인증 흐름

1. Web3Auth 로그인/인증
2. 사용자 **이름 정보 유무**에 따라 라우팅
   - 이름 정보 있음 → `/main`
   - 이름 정보 없음 → `/info`에서 이름/이메일 입력
3. 유저 정보를 백엔드로 전송 → **MongoDB 저장**

### 의도

- Web3Auth 로그인만으로 끝내지 않고,
  서비스 운영에 필요한 최소 프로필을 수집/저장하여
  이후 프로젝트 참여/기록 관리가 가능하도록 설계했습니다.

<br />

## 🗂️ IPFS 업로드 (Pinata)

### 파일 업로드 시나리오

1. 프론트 → 백엔드로 업로드 API 요청 + 파일 전송
2. 백엔드 → Pinata로 업로드 요청
3. Pinata 업로드 완료 → **CID 반환**
4. 백엔드는 CID를 DB에 저장
5. 프론트는 CID(또는 gateway URL)로 리소스를 조회하여 렌더링

### 의도

- 이미지 등 정적 리소스를 중앙 서버에만 의존하지 않고
  **CID 기반으로 추적 가능한 형태**로 남겨 투명성을 강화했습니다.

<br />

## ⚙️ CI/CD & 인프라

### Frontend

- **Vercel 배포**
- `main` 브랜치 push 시 **프로덕션 빌드/배포 자동화**

### Backend

- **AWS EC2 + Docker**로 배포/운영
- GitHub Actions 기반으로 push 시 **자동 빌드/배포**
- **Caddy**로 HTTPS 인증 + Reverse Proxy 구성

<br />
