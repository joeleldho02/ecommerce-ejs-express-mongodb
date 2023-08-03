class Node {
    constructor(value) {
        this.value= value;
        this.left= null;
        this.right=null;
    }
} 

class BST {
    constructor() {
        this.root= null;
    }
    
    insert(value) {
        let node= new Node(value);
        if(this.root=== null) {
            this.root= node;
            return this;
        }
        let current= this.root;
        while() {
            if(value< current.value) {
                if(current.left= null) {
                    current.left= node;
                    return this;
                }
            }
        }
    }

    isValid() {
        if(!this.root) return true;
        let left, right= false;
        if(left) {
            right= isValid()
        }
        return false;
    }
}