import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Collapsible,
  Heading,
  Grommet,
  Layer,
  ResponsiveContext,
  TextInput,
  Tag
} from 'grommet';
import { FormClose, Notification } from 'grommet-icons';

const theme = {
  global: {
    colors: {
      brand: '#228BE6'
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

const AppBar = (props) => (
  <Box
    tag='header'
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation='medium'
    style={{ zIndex: '1' }}
    {...props}
  />
);

function App() {
  const [showSidebar, setShowSidebar] = useState('');
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState(() => {
    return [{
      name:"Server", value:"This is a multiplayer text adventure game! " +
      "Type commands to interact with the world and other players. " +
      "For example, type 'walk forward' to walk, 'turn right' to turn, etc. " +
      "Use 'say hello' to say hello to players around you. Use 'look' or 'vibe check' to " + 
      "examine your immediate environment. For the full list of commands, " +
      "check the wiki: https://github.com/beefy/textmmo/wiki"
    }];
  });

  useEffect(() => {
    console.log(messages)
  });

  const Messages = () => {
    var ret;
    for(var i = 0; i < messages.length; i++) {
      ret = [ret,
        <Box pad={{horizontal: "xlarge", top: "large"}}>
          <Tag border={false} name={messages[i]['name']} value={messages[i]["value"]} />
        </Box>
      ];
    }
    return ret;
  }

  const InputBox = () => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        setMessages(messages.concat([{name: "You", value: value}]));
        setValue('');
      }
    }
  
    return (
      <TextInput
        key="input"
        placeholder="type here"
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    );
  }
  

  return (
    <Grommet theme={theme} full>
      <ResponsiveContext.Consumer>
        {size => (
          <Box fill>
            <AppBar>
              <Heading level='3' margin='none'>TextMMO</Heading>
              <Button
                icon={<Notification />}
                onClick={() => setShowSidebar(!showSidebar)}
              />
              </AppBar>
              <Box direction='row' flex overflow={{ horizontal: 'hidden' }}>
                <Box fill>
                  <Box overflow={{vertical: "scroll"}}>
                    <Messages/>
                  </Box>
                  <Box pad={{horizontal: "medium", bottom: "large"}}>
                    {InputBox()}
                  </Box>
                </Box>
                {(!showSidebar || size !== 'small') ? (
                  <Collapsible direction="horizontal" open={showSidebar}>
                  <Box
                    flex
                    width='medium'
                    background='light-2'
                    elevation='small'
                    align='center'
                    justify='center'
                  >
                    sidebar
                  </Box>
                  </Collapsible>
                 ): (
                  <Layer>
                     <Box
                      background='light-2'
                      tag='header'
                      justify='end'
                      align='center'
                      direction='row'
                    >
                      <Button
                        icon={<FormClose />}
                        onClick={() => setShowSidebar(false)}
                      />
                    </Box>
                    <Box
                      fill
                      background='light-2'
                      align='center'
                      justify='center'
                    >
                      sidebar
                    </Box>
                  </Layer>
                 )}
              </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
}

export default App;
