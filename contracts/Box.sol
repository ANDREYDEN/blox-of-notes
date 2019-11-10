pragma solidity ^0.5.11;

contract Box {
    uint public id;
    string public title;
    uint public openingTime;
    uint public numberOfNotes;
    address creator;

    mapping(address => bool) public voted;
    mapping(uint => string) notes;
    mapping(address => string) voterNote;

    constructor (uint _id, string memory _title, uint _openingTime, address _creator) public {
        id = _id;
        title = _title;
        openingTime = _openingTime;
        creator = _creator;
    }

    function submitNote(string memory note, address sender) public {
        require(!voted[sender], "You can't submit more than once");
        require(now <= openingTime, "The box has already been opened");

        // record the submition
        voted[sender] = true;

        // record the submited note
        numberOfNotes++;
        notes[numberOfNotes] = note;
        voterNote[sender] = note;
    }

    function getNote(uint noteNumber) public view returns (string memory) {
        require(now > openingTime, "The box is still closed");
        return notes[noteNumber];
    }

    function getIndividualNote(address sender) public view returns (string memory) {
        if (sender == creator) {
            return "<Creator>";
        }
        require(voted[sender], "You have not yet voted");
        return voterNote[sender];
    }
}

contract Storage {
    mapping(address => uint) public voterBoxCount;
    mapping(address => mapping(uint => Box)) public voterBoxes;
    mapping(address => Box) public boxes;
    mapping(address => bool) boxExists;

    function deployBox(string memory title, uint openTime) public {
        voterBoxCount[msg.sender]++;
        uint boxCount = voterBoxCount[msg.sender];

        Box box = new Box(boxCount, title, openTime, msg.sender);
        voterBoxes[msg.sender][boxCount] = box;
        boxes[address(box)] = box;
        boxExists[address(box)] = true;
    }

    function getMyBox(uint id) public view returns (Box) {
        return voterBoxes[msg.sender][id];
    }

    function submitNote(string memory note, address boxAddress) public {
        require(boxExists[boxAddress], "The box doesn't exist");
        Box box = boxes[boxAddress];
        box.submitNote(note, msg.sender);

        voterBoxCount[msg.sender]++;
        voterBoxes[msg.sender][voterBoxCount[msg.sender]] = box;
    }

    function getBoxOpeningTime(uint id) public view returns (uint) {
        //require(id > 0 && id < voterBoxCount[msg.sender], "Id is not valid");
        return voterBoxes[msg.sender][id].openingTime();
    }

    function getBoxTitle(uint id) public view returns (string memory) {
        //require(id > 0 && id < voterBoxCount[msg.sender], "Id is not valid");
        return voterBoxes[msg.sender][id].title();
    }

    function getBoxIndividualNote(uint id) public view returns (string memory) {
        //require(id > 0 && id < voterBoxCount[msg.sender], "Id is not valid");
        return voterBoxes[msg.sender][id].getIndividualNote(msg.sender);
    }
}