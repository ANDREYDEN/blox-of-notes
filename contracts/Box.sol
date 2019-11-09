pragma solidity ^0.5.11;

contract Box {
    string public title;
    uint public openingTime;
    uint public numberOfNotes;
    bool ended;

    mapping(address => bool) public voters;
    mapping(uint => string) public notes;

    event BoxOpened();

    constructor(uint _lifetime, string memory _title) public {
        openingTime = now + _lifetime;
        title = _title;
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

    function openBox() public {
        require(now >= openingTime, "The submition period is still in progress");
        require(!ended, "The box has already been opened.");

        ended = true;
        emit BoxOpened();
    }
}