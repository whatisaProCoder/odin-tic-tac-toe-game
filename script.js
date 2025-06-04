const ThemeManager = (function FactoryFunction() {
    const htmlElement = document.documentElement;

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark").matches;
    const savedTheme = localStorage.getItem("theme");

    const applyInitialTheme = () => {
        if (savedTheme) {
            htmlElement.setAttribute("data-theme", savedTheme);
        } else {
            htmlElement.setAttribute("data-theme", prefersDarkScheme ? "dark" : "light");
        }
    };

    const getCurrentTheme = () => {
        return htmlElement.getAttribute("data-theme");
    }

    const applyDarkMode = () => {
        htmlElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    }

    const applyLightMode = () => {
        htmlElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }

    const init = () => {
        applyInitialTheme();
    };

    init();

    return { getCurrentTheme, applyDarkMode, applyLightMode };
})();

const SettingsDialogBox = (function FactoryFunction() {
    const settingsButton = document.querySelector(".settings");
    const settingsDialogBoxElement = document.querySelector(".settings-dialog-box");
    const closeButton = settingsDialogBoxElement.querySelector(".close-button");
    const darkModeSwitch = settingsDialogBoxElement.querySelector(".dark-mode-switch-checkbox");

    const openDialogBox = () => {
        settingsDialogBoxElement.showModal();
    };

    const closeDialogBox = () => {
        settingsDialogBoxElement.close();
    };

    const setInitialState = () => {
        if (ThemeManager.getCurrentTheme() == "light") {
            darkModeSwitch.checked = false;
        } else if (ThemeManager.getCurrentTheme() == "dark") {
            darkModeSwitch.checked = true;
        }
    }

    const bindEvents = () => {
        if (settingsButton) {
            settingsButton.addEventListener("click", openDialogBox);
        }

        if (closeButton) {
            closeButton.addEventListener("click", closeDialogBox);
        }

        if (darkModeSwitch) {
            darkModeSwitch.addEventListener("change", () => {
                if (darkModeSwitch.checked) {
                    ThemeManager.applyDarkMode();
                } else {
                    ThemeManager.applyLightMode();
                }
            });
        }
    };

    const init = () => {
        setInitialState();
        bindEvents();
    }

    init();
})();

const ProfileDialogBox = (function FactoryFunction() {
    const profilePicture = document.querySelector(".profile-picture");
    const profileDialogBoxElement = document.querySelector(".profile-dialog-box");
    const closeButton = profileDialogBoxElement.querySelector(".close-button");

    const openDialogBox = () => {
        profileDialogBoxElement.showModal();
    };

    const closeDialogBox = () => {
        profileDialogBoxElement.close();
    };

    const bindEvents = () => {
        if (profilePicture) {
            profilePicture.addEventListener("click", openDialogBox);
        }

        if (closeButton) {
            closeButton.addEventListener("click", closeDialogBox);
        }
    };

    const init = () => {
        bindEvents();
    }

    init();
})();

const GameBoard = (function FactoryFunction() {
    let board = ["", "", "", "", "", "", "", "", ""];
    const gameBoard = document.querySelector(".game-board");

    const render = () => {
        gameBoard.innerHTML = "";
        board.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("cell");
            cellElement.dataset.index = index;
            cellElement.textContent = cell;
            gameBoard.appendChild(cellElement);
        })
    };

    const update = (index, marker) => {
        if (board[index] === "") {
            board[index] = marker;
            render();
            return true;
        }
        return false;
    };

    const reset = () => {
        board = ["", "", "", "", "", "", "", "", ""];
        render();
    };

    const getBoard = () => board;

    const getDOMElement = () => gameBoard;

    return { render, update, reset, getBoard, getDOMElement };
})();

const Player = (playerName, marker) => {
    return { playerName, marker };
}

const GameController = (function FactoryFunction() {
    const playerX = Player("Player X", "X");
    const playerO = Player("Player O", "O");
    let currentPlayer = playerX;
    let gameOver = false;

    const EditPlayerNameButton = document.querySelector(".edit-player-name-button");
    const RestartButton = document.querySelector(".restart-game-button");

    const message = document.querySelector(".message");

    const intializeMessage = () => {
        message.textContent = `${currentPlayer.playerName}'s turn`;
    }

    const checkWinner = () => {
        const board = GameBoard.getBoard();
        const winCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        const winningCombo = winCombinations.find((combination) => {
            const [a, b, c] = combination;
            return board[a] && board[a] === board[b] && board[b] === board[c];
        });
        return winningCombo;
    };

    const handleClick = (e) => {
        const index = e.target.dataset.index;
        if (!index || gameOver) return;

        const updatingSuccess = GameBoard.update(index, currentPlayer.marker);
        if (!updatingSuccess) return;

        const winningCombo = checkWinner();
        if (winningCombo) {
            gameOver = true;
            message.textContent = `${currentPlayer.playerName} wins!`;
            message.classList.add("message-player-wins");
            winningCombo.forEach((index) => {
                const winningCell = GameBoard.getDOMElement().querySelector(`[data-index="${index}"]`);
                setTimeout(() => {
                    winningCell.classList.add("cell-winning-highlight");
                }, 30);
            });
            return;
        }

        if (GameBoard.getBoard().includes("") === false) {
            message.textContent = "It's a draw";
            message.classList.add("message-game-draw");
            gameOver = true;
            return;
        }

        currentPlayer = currentPlayer === playerX ? playerO : playerX;
        message.textContent = `${currentPlayer.playerName}'s turn`;
    };

    const restart = () => {
        GameBoard.reset();
        currentPlayer = playerX;
        gameOver = false;
        message.textContent = `${currentPlayer.playerName}'s turn`;
        message.classList.remove("message-player-wins");
        message.classList.remove("message-game-draw");
    }

    const editPlayerName = (playerXName, playerOName) => {
        if (!playerXName || !playerOName) return;
        playerX.playerName = playerXName;
        playerO.playerName = playerOName
        if (!gameOver) {
            message.textContent = `${currentPlayer.playerName}'s turn`;
        }
    }


    const bindEvents = () => {
        GameBoard.getDOMElement().addEventListener("click", handleClick);
        RestartButton.addEventListener("click", restart);
        EditPlayerNameButton.addEventListener("click", editPlayerName);
    }

    const init = () => {
        intializeMessage();
        bindEvents();
    }

    init();

    return { editPlayerName };
})();

const EditPlayerNameDialogBox = (function FactoryFunction() {
    const editPlayerNameDialogBoxElement = document.querySelector(".edit-player-name-dialog-box");
    const closeButton = editPlayerNameDialogBoxElement.querySelector(".close-button");
    const editPlayerNameForm = editPlayerNameDialogBoxElement.querySelector(".edit-player-name-form");
    const editPlayerNameButton = document.querySelector(".edit-player-name-button");

    const openDialogBox = () => {
        editPlayerNameDialogBoxElement.showModal();
    };

    const closeDialogBox = () => {
        editPlayerNameDialogBoxElement.close();
    };

    const bindEvents = () => {
        if (closeButton) {
            closeButton.addEventListener("click", closeDialogBox);
        }

        if (editPlayerNameButton) {
            editPlayerNameButton.addEventListener("click", openDialogBox);
        }
    };

    const handleForm = () => {
        editPlayerNameForm.addEventListener("submit", event => {
            event.preventDefault();

            const formData = new FormData(editPlayerNameForm);

            const playerXName = formData.get("player-x-name");
            const playerOName = formData.get("player-o-name");

            GameController.editPlayerName(playerXName, playerOName);
            editPlayerNameDialogBoxElement.close();
            editPlayerNameForm.reset();
        })
    }

    const init = () => {
        bindEvents();
        handleForm();
    }

    init();
})();

GameBoard.render();