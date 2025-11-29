// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustFund {
    struct Milestone {
        string title;
        uint256 allocatedAmount;
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
        mapping(uint256 => Milestone) milestones;
        mapping(address => uint256) contributions;
        bool exists;
    }

    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId;

    // 1) 프로젝트 생성
    function createProject(string[] memory titles, uint256[] memory amounts) external {
        require(titles.length == amounts.length, "Length mismatch");

        Project storage p = projects[nextProjectId];
        p.owner = msg.sender;
        p.exists = true;

        for (uint256 i = 0; i < titles.length; i++) {
            p.milestones[i].title = titles[i];
            p.milestones[i].allocatedAmount = amounts[i];
            p.milestones[i].completed = false;
            p.milestones[i].approved = false;
            p.milestoneCount++;
        }

        nextProjectId++;
    }

    // 2) 펀딩 참여 (ETH deposit)
    function fundProject(uint256 projectId) external payable {
        Project storage p = projects[projectId];
        require(p.exists, "Project not found");
        require(msg.value > 0, "Need ETH");

        p.contributions[msg.sender] += msg.value;
        p.totalFunding += msg.value;
    }

    // 3) 마일스톤 완료 요청
    function requestMilestone(uint256 projectId, uint256 milestoneId) external {
        Project storage p = projects[projectId];
        require(msg.sender == p.owner, "Not owner");
        require(!p.milestones[milestoneId].completed, "Already completed");
    }

    // 4) 참여자 투표
    function voteMilestone(uint256 projectId, uint256 milestoneId, bool approve) external {
        Project storage p = projects[projectId];
        require(p.contributions[msg.sender] > 0, "Not funder");

        Milestone storage m = p.milestones[milestoneId];
        require(!m.voted[msg.sender], "Already voted");

        m.voted[msg.sender] = true;

        if (approve) m.yesVotes += 1;
        else m.noVotes += 1;

        if (m.yesVotes > m.noVotes) {
            m.approved = true;
        }
    }

    // 5) 마일스톤 승인되면 금액 송금
    function releaseMilestone(uint256 projectId, uint256 milestoneId) external {
        Project storage p = projects[projectId];
        require(msg.sender == p.owner, "Not owner");

        Milestone storage m = p.milestones[milestoneId];
        require(m.approved, "Not approved");
        require(!m.completed, "Already completed");

        m.completed = true;

        payable(msg.sender).transfer(m.allocatedAmount);
    }
}
