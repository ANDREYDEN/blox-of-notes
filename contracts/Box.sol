pragma solidity ^0.5.11;

contract Box {
    string public title;
    uint public openingTime;
    uint public numberOfNotes;
    address creator;

    mapping(address => bool) public voters;
    mapping(uint => string) public notes;

    function deployBox(string memory _title, uint _lifetime) public {
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

    // function open() public {
    //     require(now >= openingTime, "The submition period is still in progress");
    //     require(!opened, "The box has already been opened.");
    //     require(msg.sender, creator, "Only the creator can open the box");
    //     opened = true;
    // }
}