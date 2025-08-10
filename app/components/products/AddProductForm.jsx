const { default: Button } = require("../Button");
const { default: Modal } = require("../Modal");
const { default: CreateProductForm } = require("./CreateProductForm");

function AddProductForm() {
  return (
    <div>
      <Modal>
        <Modal.Open opens="event-form">
          <Button size="small" variation="primary">
            Add Event
          </Button>
        </Modal.Open>
        <Modal.Window name="event-form">
          <CreateProductForm onCloseModal={Modal.close} />
        </Modal.Window>
      </Modal>
    </div>
  );
}

export default AddProductForm;
