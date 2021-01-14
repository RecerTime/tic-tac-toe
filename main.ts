let playerScore = 0;
let AIScore = 0;
let ties = 0;

let playerHasPlayed = false;

let playerPosition = 0;

//I havent found a way to create a empty list of sprites
let sprites = [game.createSprite(2, 2)];
sprites[0].delete();
sprites.removeAt(0);

//A lits of all the slots remaning on the board
let openSlots: number[];

//A list of all slots chosen and which player chose it
let playedSlots: number[];

//A list of all the different weights for the different slots
let slotWeights: number[];

//A reference list of unplayed slots
const baseSlots = [0, 0, 0, 0, 0, 0, 0, 0, 0];

//The default weight of the boards slots
const defaultWeights = [4, 1, 4, 1, 8, 1, 4, 1, 4];

//The brightness of the sprite for each player
const playerBrightness = 255;
const AIBrightness = 75;

//How much more wieght a slot will get if it has the possibility to end the game
const weightDelta = 16;

Setup();

function Setup(){    
    playerHasPlayed = false;

    playerPosition = 0;

    openSlots = [];
    for (let i = 0; i <= 8; i++){
        openSlots.push(i);
    }

    slotWeights = defaultWeights;

    playedSlots = baseSlots;

    GenerateSprite(0, playerBrightness);
}

input.onButtonPressed(Button.A, function () {
    console.log("---> 0");
    PlayerTurn(0);
})
input.onButtonPressed(Button.B, function () {
    console.log("---> 1");
    PlayerTurn(1);
})
input.onButtonPressed(Button.AB, function () {
    console.log("---> 2");
    PlayerTurn(2);
})

/*
0 <= index <= 8 corresponds to diffrent coordinates on the board in the following pattern:
.....
.012.
.345.
.678.
.....

y = (index / 3) + 1
x = (index % 3) + 1
*/

function GetPositionFromSlotsY (inputY: number) {
    return Math.floor(inputY/3) + 1
}

function GetPositionFromSlotsX (inputX: number) {
    return (inputX % 3) + 1
}

function MoveSprite (index: number) {
    //Checks if the sprite is at the first or last slot
    if (index < 0) {
        index = openSlots.length - 1;
        playerPosition = openSlots.length - 1;
    } else if (index > openSlots.length - 1) {
        index = 0
        playerPosition = 0;
    }

    sprites[sprites.length-1].setX(GetPositionFromSlotsX(openSlots[index]));
    sprites[sprites.length-1].setY(GetPositionFromSlotsY(openSlots[index]));
}

//Returns the index that holds num in openSlots
function GetOpenSlotIndexFromNum(num: number){
    let returnIndex = null;
    for(let i = 0; i < openSlots.length; i++){
        if(openSlots[i] == num){
            returnIndex = i;
        }
    }
    console.log("ret = " + returnIndex);
    return returnIndex;
}

function AIPlay(){
    let AIPosition = AIDecision();
    GenerateSprite(AIPosition, AIBrightness);
    SelectSlot(2, AIPosition);

    if(CheckWinner()){
        basic.pause(1000);
        ShowWinner();
    } else {
        playerHasPlayed = false;
        playerPosition = 0;
        GenerateSprite(playerPosition, playerBrightness);
    }    
}

function AIDecision(){
    let decidedIndex;
    let sumWeight = 0;

    let validCounter = 0;

    //Adds up all the values in the slotWeights list
    for(let i = 0; i < slotWeights.length; i++){
        if(slotWeights[i] != NaN && slotWeights[i] != null){
            sumWeight += slotWeights[i];
            validCounter++; 
        }
    }

    //Checks if the list contains any invalid values
    if(validCounter == slotWeights.length){
        //Randomizes one number based on the slotWeights list
        let randomIndex = randint(0, sumWeight);

        let sum = 0;
        let i = 0;
        let lessThanRef = true;
        
        while(lessThanRef){
            sum += slotWeights[i];

            if(sum >= randomIndex){
                lessThanRef = false;
            } else {
                i++;
            }
        }

        decidedIndex = i;
    } else {
        console.log("Invalid index found!");
        decidedIndex = 0;
    }

    return decidedIndex;
}

function AdjustWeights(adjustedIndex: number){
    let adjustedSlot = openSlots[adjustedIndex]

    //Checks if any player has two sprites in a row
    let x = AdjustSlot(adjustedSlot, "x");
    let y = AdjustSlot(adjustedSlot, "y");
    let d = AdjustDiagonal(adjustedSlot);

    console.log("x = " + x + ", y = " + y + ", d = " + d);

    //Increases the chance for a slot to be picked by the AI player
    if(x >= 0){
    slotWeights[GetOpenSlotIndexFromNum(x)] += weightDelta;
    }
    if(y >= 0){
        slotWeights[GetOpenSlotIndexFromNum(y)] += weightDelta;
    }
    if(d >= 0){
    slotWeights[GetOpenSlotIndexFromNum(d)] += weightDelta;
    }
    
    console.log(openSlots);
    console.log(slotWeights);
}

function AdjustSlot(placedPosition: number, direction: string){
    let slot = -1;
    //The distance between the chosen index (slot) and the index of the slot that will be checked
    let slotDistance = 0;
    let index;

    if(direction == "x"){
        slotDistance = 1;
        index = placedPosition % 3;
    } else if (direction == "y"){
        slotDistance = 3;
        index = Math.floor(placedPosition/3);
    }

    switch(index){
        case 0:
            if(playedSlots[placedPosition + slotDistance] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition + slotDistance * 2]){
                    slot = placedPosition + slotDistance;
                }
            } else if(playedSlots[placedPosition + slotDistance * 2] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition + slotDistance]){
                    slot = placedPosition + slotDistance * 2;
                }
            }
        break;

        case 1:    
            if(playedSlots[placedPosition + slotDistance] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition - slotDistance]){
                    slot = placedPosition + slotDistance;
                }
            } else if(playedSlots[placedPosition - slotDistance] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition + slotDistance]){
                    slot = placedPosition - slotDistance;
                }
            }
        break;

        case 2:
            if(playedSlots[placedPosition - slotDistance] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition - slotDistance * 2]){
                    slot = placedPosition - slotDistance;
                }
            } else if(playedSlots[placedPosition - slotDistance * 2] == 0){
                if(playedSlots[placedPosition] == playedSlots[placedPosition - slotDistance]){
                    slot = placedPosition - slotDistance * 2;
                }
            }
        break;
    }
    return slot;
}

function AdjustDiagonal(num: number){
    let slot = -1;

    if(num == 4){
        if(playedSlots[4] == playedSlots[0]){
            if(playedSlots[8] == 0){
                slot = 8;
            }
        } else if(playedSlots[4] == playedSlots[8]){
            if(playedSlots[0] == 0){
                slot = 0;
            }
        }

        if(playedSlots[4] == playedSlots[2]){
            if(playedSlots[6] == 0){
                slot = 6;
            }
        } else if(playedSlots[4] == playedSlots[6]){
            if(playedSlots[2] == 0){
                slot = 2;
            }
        }
    }

    if(num == 0){
        if(playedSlots[0] == playedSlots[4]){
            if(playedSlots[8] == 0){
                slot = 8;
            }
        } else if(playedSlots[0] == playedSlots[8]){
            if(playedSlots[4] == 0){
            slot = 4;
            }
        }
    }
    if(num == 8){
        if(playedSlots[8] == playedSlots[4]){
            if(playedSlots[0] == 0){
                slot = 0;
            }
        } else if(playedSlots[8] == playedSlots[0]){
            if(playedSlots[4] == 0){
            slot = 4;
            }
        }
    }

    if(num == 2){
        if(playedSlots[2] == playedSlots[4]){
            if(playedSlots[6] == 0){
                slot = 6;
            }
        } else if(playedSlots[2] == playedSlots[6]){
            if(playedSlots[4] == 0){
            slot = 4;
            }
        }
    }
    if(num == 6){
        if(playedSlots[6] == playedSlots[4]){
            if(playedSlots[2] == 0){
                slot = 2;
            }
        } else if(playedSlots[6] == playedSlots[2]){
            if(playedSlots[4] == 0){
            slot = 4;
            }
        }
    }

    return slot;
}

function GenerateSprite(spritePositionIndex: number, brightness: number){
    let tempSprite = game.createSprite(GetPositionFromSlotsX(openSlots[spritePositionIndex]), GetPositionFromSlotsY(openSlots[spritePositionIndex]));
    tempSprite.setBrightness(brightness);
    sprites.push(tempSprite);
}

function PlayerTurn(input: number){
        switch(input){
            case 0:
            playerPosition--;
            break;

            case 1:
            playerPosition++;
            break;

            case 2:
            playerHasPlayed = true;
            break;
        }

        if(playerHasPlayed){
            SelectSlot(1, playerPosition);
            if(CheckWinner()){
            ShowWinner();
        } else {
            AIPlay();
            }
        } else {
            MoveSprite(playerPosition);
        }
}

function SelectSlot(player: number, playedIndex: number){
    playedSlots[openSlots[playedIndex]] = player;
    AdjustWeights(playedIndex);
    slotWeights.removeAt(playedIndex);
    openSlots.removeAt(playedIndex);
}

function CheckWinner(){
    let win = false;

    let winNum = 0;

    //Checks Horizontal Win Scenarios
    if(playedSlots[0] != 0 && playedSlots[0] == playedSlots[1] && playedSlots[1] == playedSlots[2]){
        winNum = playedSlots[0];
    }

    if(playedSlots[3] != 0 && playedSlots[3] == playedSlots[4] && playedSlots[4] == playedSlots[5]){
        winNum = playedSlots[3];
    }

    if(playedSlots[6] != 0 && playedSlots[6] == playedSlots[7] && playedSlots[7] == playedSlots[8]){
        winNum = playedSlots[6];
    }
    //

    //Checks Vertical Win Scenarios
    if(playedSlots[0] != 0 && playedSlots[0] == playedSlots[3] && playedSlots[3] == playedSlots[6]){
        winNum = playedSlots[0];
    }

    if(playedSlots[1] != 0 && playedSlots[1] == playedSlots[4] && playedSlots[4] == playedSlots[7]){
        winNum = playedSlots[1];
    }

    if(playedSlots[2] != 0 && playedSlots[2] == playedSlots[5] && playedSlots[5] == playedSlots[8]){
        winNum = playedSlots[2];
    }
    //

    //Checks Diagonal Win Scenarios
    if(playedSlots[0] != 0 && playedSlots[0] == playedSlots[4] && playedSlots[4] == playedSlots[8]){
        winNum = playedSlots[0];
    }

    if(playedSlots[2] != 0 && playedSlots[2] == playedSlots[4] && playedSlots[4] == playedSlots[6]){
        winNum = playedSlots[2];
    }

    switch(winNum){
        case 0:
            //Checks if the board is full
            if(openSlots.length < 1){
                ties++;
                win = true;
            }
        break;

        case 1:
            playerScore++;
            win = true;
        break;

        case 2:
            AIScore++;
            win = true;
        break;
    }

    return win;
}

function ShowWinner(){
    basic.pause(500);

    ClearSprites();

    basic.showString("W:" + playerScore)

    basic.showString("L:" + AIScore);

    basic.showString("T:" + ties);

    basic.pause(500);

    Setup();
}

function ClearSprites(){
    for(let i = 0; i < sprites.length; i++){
        sprites[i].delete();
    }
    sprites = [];
}