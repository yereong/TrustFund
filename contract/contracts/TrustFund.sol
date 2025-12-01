// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustFund {
    struct Milestone {
        string title;
        uint256 allocatedAmount;
        bool requested;
        bool completed;
        bool approved;
        uint256 yesVotes;
        uint256 noVotes;
        mapping(address => bool) voted;
    }

    struct Project {
        address owner;
        uint256 totalFunding;
        uint256 milestoneCount;
        uint256 funderCount;
        mapping(uint256 => Milestone) milestones;
        mapping(address => uint256) contributions;
        bool exists;
    }

    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId;

    // 🔥 프로젝트 생성 이벤트
    event ProjectCreated(uint256 indexed projectId, address indexed creator);

    // 1) 프로젝트 생성
    function createProject(string[] memory titles, uint256[] memory amounts) external {
        require(titles.length == amounts.length, "Length mismatch");

        uint256 projectId = nextProjectId;  // 현재 ID

        Project storage p = projects[projectId];
        p.owner = msg.sender;
        p.exists = true;

        for (uint256 i = 0; i < titles.length; i++) {
            p.milestones[i].title = titles[i];
            p.milestones[i].allocatedAmount = amounts[i];
            p.milestones[i].requested = false;
            p.milestones[i].completed = false;
            p.milestones[i].approved = false;
            p.milestoneCount++;
        }

        // 🔥 이벤트 emit (프론트에서 projectId 가져갈 수 있게!)
        emit ProjectCreated(projectId, msg.sender);

        nextProjectId++;
    }

    // 2) 펀딩 참여 (ETH deposit)
    function fundProject(uint256 projectId) external payable {
        Project storage p = projects[projectId];
        require(p.exists, "Project not found");
        require(msg.value > 0, "Need ETH");

        if (p.contributions[msg.sender] == 0) {
        p.funderCount += 1; // 🔥 처음 펀딩하는 유저
    }

        p.contributions[msg.sender] += msg.value;
        p.totalFunding += msg.value;
    }

    // 3) 마일스톤 완료 요청
    event MilestoneRequested(uint256 indexed projectId, uint256 indexed milestoneId);

    function requestMilestone(uint256 projectId, uint256 milestoneId) external {
        Project storage p = projects[projectId];
        require(p.exists, "Project not found");
        require(msg.sender == p.owner, "Not owner");
        require(milestoneId < p.milestoneCount, "Invalid milestoneId");

        Milestone storage m = p.milestones[milestoneId];

        require(!m.completed, "Already completed");
        require(!m.requested, "Already requested");

        m.requested = true;

        emit MilestoneRequested(projectId, milestoneId);
    }

    // 4) 참여자 투표
    event MilestonePayout(uint256 indexed projectId, uint256 indexed milestoneId, uint256 amount);
    function voteMilestone(uint256 projectId, uint256 milestoneId, bool approve) external {
        Project storage p = projects[projectId];
        require(p.exists, "Project not found");
        require(milestoneId < p.milestoneCount, "Invalid milestoneId");
        require(p.contributions[msg.sender] > 0, "Not funder");

        Milestone storage m = p.milestones[milestoneId];

        require(m.requested, "Not requested yet");
        require(!m.voted[msg.sender], "Already voted");
        require(!m.completed, "Already completed");

        m.voted[msg.sender] = true;

        if (approve) {
            m.yesVotes += 1;
        } else {
            m.noVotes += 1;
        }

        // 🔥 과반(yesVotes * 2 > funderCount) 처음 넘어가는 순간
        // 자동으로 approved + completed + 송금까지 진행
        if (!m.approved && (m.yesVotes * 2 > p.funderCount)) {
            m.approved = true;
            m.completed = true;

            uint256 amount = m.allocatedAmount;
            require(amount > 0, "No allocation");
            require(address(this).balance >= amount, "Not enough ETH");

            (bool ok, ) = p.owner.call{value: amount}("");
            require(ok, "Transfer failed");

            emit MilestonePayout(projectId, milestoneId, amount);
        }
    }

    // 5) 마일스톤 승인되면 금액 송금
    function releaseMilestone(uint256 projectId, uint256 milestoneId) external {
        Project storage p = projects[projectId];
        require(p.exists, "Project not found");
        require(milestoneId < p.milestoneCount, "Invalid milestoneId");
        require(msg.sender == p.owner, "Not owner");

        Milestone storage m = p.milestones[milestoneId];
        require(m.approved, "Not approved");
        require(!m.completed, "Already completed");

        m.completed = true;

        payable(msg.sender).transfer(m.allocatedAmount);
    }
}
