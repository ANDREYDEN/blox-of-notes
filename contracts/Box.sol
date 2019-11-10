pragma solidity ^0.5.11;

contract Box {
    uint public id;
    string public title;
    uint public openingTime;
    uint public numberOfNotes;
    address creator;

    mapping(address => bool) public voters;
    mapping(uint => string) public notes;

    constructor (uint _id, string memory _title, uint _lifetime) public {
        id = _id;
        title = _title;
        openingTime = now + _lifetime;
        creator = msg.sender;
    }

    function submitNote(string memory note) public {
        require(!voters[msg.sender], "You can't submit more than once");
        require(now <= openingTime, "The box has already been opened");

        // record the submition
        voters[msg.sender] = true;

        // record the submited note
        numberOfNotes++;
        notes[numberOfNotes] = note;
    }

    function getNote(uint noteNumber) public view returns (string memory) {
        require(now > openingTime, "The box is still closed");
        return notes[noteNumber];
    }
}

contract Storage {
    mapping(address => uint) voterBoxCount;
    mapping(address => mapping(uint => Box)) voterBoxes;
    mapping(address => Box) boxes;
    mapping(address => bool) boxExists;
    mapping(address => uint) voterNoteCount;
    mapping(address => mapping(uint => string)) voterNotes;

    function deployBox(string memory title, uint lifetime) public {
        voterBoxCount[msg.sender]++;
        uint boxCount = voterBoxCount[msg.sender];
        Box box = new Box(boxCount, title, lifetime);
        voterBoxes[msg.sender][boxCount] = box;
        boxes[address(box)] = box;
        boxExists[address(box)] = true;
    }

    function submitNote(string memory note, address boxAddress) public {
        require(boxExists[boxAddress], "The box doesn't exist");
        Box box = boxes[boxAddress];
        box.submitNote(note);

        voterNoteCount[msg.sender]++;
        voterNotes[msg.sender][voterNoteCount[msg.sender]] = note;
    }
}