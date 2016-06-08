# O projekcie

## Temat
Threelab.

Gra 3D* oparta na three.js, w której gracz ma za zadanie opuścić labirynt. Urozmaiceniem rozgrywki jest to że gracz porusza się po labiryncie równocześnie w różnych miejscach (dzielony ekran).

<sub>* Może i grafika jest 3d, ale plansza pozostaje 2d.</sub>

## Mechanika gry
Gracz porusza się po labiryncie w wielu instancjach równocześnie. Różnią się one pozycją lub orientacją w przestrzeni.

Jeśli w jakiejś instancji ruch jest niedozwolony (nachodziłby na ścianę), nie jest on tam wykonywany. Ruchy w pozostałych instancjach mogą się odbyć jeśli tylko są dozwolone.

Zadaniem gracza jest opuszczenie planszy. Poza planszą muszą się znaleźć wszystkie instancje. W tym momencie zostanie uruchomiony kolejny poziom.

Gdyby w trakcie rozgrywki dwie instancje osiągnęły taki sam stan (pozycja + orientacja), jedna z nich zostanie usunięta jako duplikat.


# Uruchomienie

Uruchom `game.html` w swojej ulubionej, nowoczesnej przeglądarce.

### Sterowanie
Klawiaturą.

* `w`, `s` - naprzód, do tyłu
* `q`, `e` - obrót w lewo, w prawo
* `a`, `d` - ruch w lewo, prawo

#### Dodatkowe polecenia (do celów testowych)
* `1`..`9` - uruchom dany poziom
* `spacja` - oddalenie widoku


# Techniczne

## Implementacja
Implementacja objęła głównie:

* wczytanie mapy z postaci tekstowej (`maps.js`)
* utworzenie na tej podstawie sceny
* obsługę sterowania, poruszania się (animacja)
* i inne pomniejsze funkcjonalności

## Wykorzystane biblioteki
Następujące biblioteki zostały użyte w projekcie

* *three.js*
* *THREEx.KeyboardState* - do sprawdzania stanu klawiatury

## Struktura kodu
Na kod gry składają się następujące klasy:

* `MapLoader` - obsługuje pobieranie danych mapy
* `Map` - obsługuje stworzenie mapy z danych oraz pobieranie informacji o mapie (polach), wykrywanie kolizji, ...
* `TransitingProperty` - pomocnicza klasa do przechowywania wartości, na podstawie których będzie dokonywana animacja w czasie
* `PlayerControl` - reprezentacja pojedynczej instancji gracza. Przechowuje pozycję, orientację (jako `TransitingProperty`). Aktualizuje na ich podstawie obiekty sceny (kamerę, światła)
* `PlayerControls` - obsługuje instancje `PlayerControl`, pozwala na zbiorowe operacje na nich
* `SceneBuilder` - tworzy scenę na podstawie obiektów `Map` oraz `PlayerControls`. Obejmuje to utworzenie podstawowych obiektów, ustawienie parametrów sceny, jak i utworzenie geometrii mapy
* Plik `game.html` zaś składa te elementy razem i odpowiada za logikę gry.
