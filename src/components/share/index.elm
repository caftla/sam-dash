port module Chat exposing (main)

{-| If you are new to Elm, I highly recommend checking out
this guide:
    http://guide.elm-lang.org
It gives a pretty complete overview of how Elm works. For an
abbreviated read, focus on "The Elm Architecture" chapter.
    http://guide.elm-lang.org/architecture
It introduces key concepts gradually until you get to a chat
room very similar to the one here.
-}

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http


main : Program String Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { server : String
    , input : String
    , messages : List String
    }


init : String -> ( Model, Cmd Msg )
init server =
    ( Model server "" [], downloadHTML "https://caftla.github.io/slack-reports/archive/2017-05-18.html" )



-- UPDATE


type Msg
    = Input String
    | Send
    | NewEmoji String
    | NewMessage String
    | HtmlDownloaded (Result Http.Error String)


{-| Our update function reacts to a few different messages.
    1. Typing into the text field
    2. Clicking the "Send" button
    3. Emoji sent in from JavaScript
    4. Messages received from the chat server
The return value of this function is a pair. First is the
updated model. In many cases, we are just modifying the input
field. Second is some commands we want to run. We only use
this with `Send` when we want to send a message to the chat
server.
Again, check out <http://guide.elm-lang.org/architecture> to
learn more about how this works!
-}
update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ server, input, messages } as model) =
    case msg of
        Input newInput ->
            ( { model | input = newInput }
            , Cmd.none
            )

        Send ->
            ( { model | input = "" }
            , downloadHTML "https://caftla.github.io/slack-reports/archive/2017-05-18.html"
            )

        NewEmoji emoji ->
            ( { model | input = input ++ emoji }
            , Cmd.none
            )

        NewMessage newMessage ->
            ( { model | messages = newMessage :: messages }
            , Cmd.none
            )
        
        HtmlDownloaded (Ok content) ->
            ( { model | input = content } 
            , downloaded content
            )

        HtmlDownloaded (Err _) ->
            ( { model | input = "Error" }
            , Cmd.none
            )
        


downloadHTML : String -> Cmd Msg
downloadHTML url = Http.send HtmlDownloaded (Http.getString url)

-- SUBSCRIPTIONS


{-| This port lets outsiders send in emoji characters as a string.
We can subscribe to these messages from within Elm.
-}
port emoji : (String -> msg) -> Sub msg
port downloaded : String -> Cmd msg


{-| We subscribe to two kinds of messages.
  1. We want messages from the websocket chat server.
  2. We want messages sent through emoji port from JavaScript.
-}
subscriptions : Model -> Sub Msg
subscriptions { server } =
    Sub.batch
        [ 
            emoji NewEmoji
        ]



-- VIEW


view : Model -> Html Msg
view model =
    div [ class "chat-container" ]
        []
        -- [ input [ class "chat-message-input", onInput Input, value model.input ] []
        -- , button [ onClick Send ] [ text "Send me the money" ]
        -- , div [ class "chat-messages" ] (List.map viewMessage (List.reverse model.messages))
        -- ]


viewMessage : String -> Html msg
viewMessage msg =
    div [] [ text msg ]