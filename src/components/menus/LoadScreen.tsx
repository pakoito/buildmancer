import React from 'react';
import { Form, Col, Row, Alert, Button, Container } from 'react-bootstrap';
import { Play } from '../../game/types';
import { playSchema } from '../../game/typesSchemas';

const LoadScreen = ({
  onLoad,
  onMenu,
}: {
  onLoad: (g: Play) => void;
  onMenu: () => void;
}) => {
  const [loadError, setLoadError] = React.useState<string | undefined>();
  const load = (data: string) => {
    try {
      const playRaw = JSON.parse(data);
      try {
        // FIXME update schema
        //playSchema.parse(playRaw);
        onLoad(playRaw as Play);
      } catch (e) {
        setLoadError('Failed to Load - Invalid Data');
      }
    } catch (e) {
      setLoadError('Failed to Load - Bad Data');
    }
  };
  const onFormSubmit = (e: any) => {
    e.preventDefault();
    if (e.target?.fileData?.files[0] != null) {
      const reader = new FileReader();
      reader.onloadend = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result as string | undefined;
        if (result != null) {
          load(result);
        } else {
          setLoadError('Failed to read file');
        }
      };
      reader.readAsText(e.target.fileData.files[0]);
    } else if (
      e.target?.rawData?.value != null &&
      e.target?.rawData?.value != ''
    ) {
      load(e.target.rawData.value);
    }
  };
  return (
    <Form onSubmit={onFormSubmit}>
      <Container fluid>
        <Col>
          <Row>
            {loadError && (
              <>
                <Alert variant={'danger'}>{loadError}</Alert>
                <br />
                <br />
              </>
            )}
          </Row>
          <Row>
            <Form.Group>
              <Form.Label>Load File</Form.Label>
              <Form.Control type="file" name="fileData" accept=".json" />
              <Form.Text muted>Select the file to load</Form.Text>
            </Form.Group>
          </Row>
          <br />
          <Row>
            <Form.Group>
              <Form.Label>Load</Form.Label>
              <Form.Control
                name="rawData"
                as="textarea"
                rows={3}
                placeholder="Save Data"
              />
              <Form.Text muted>Paste the text of your savegame here</Form.Text>
            </Form.Group>
          </Row>
          <br />
          <Button variant="primary" type="submit">
            Load
          </Button>
        </Col>
        <br />
        <Button onClick={onMenu}>MAIN MENU</Button>
      </Container>
    </Form>
  );
};

export default LoadScreen;
