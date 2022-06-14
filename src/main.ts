class MemoryNode {
  deleted: boolean = false // using this to indicate if the node has been deallocated

  ownershipReferences: MemoryNode[] = []
  ownershipReferees = 0
  references: MemoryNode[] = []
  referees = 0

  constructor(public name: string) {
  }

  inspect() {
    console.log(`
    Name: ${this.name}
    Deleted: ${this.deleted}
    Owns: ${this.ownershipReferences.map((reference) => reference.name).join(' | ')}
    BelongsTo: ${this.ownershipReferees}
    RefersTo: ${this.references.map((reference) => reference.name).join(' | ')}
    ReferedFrom: ${this.referees}
    `)
  }

  addReference(node: MemoryNode) {
    this.references.push(node)
    node.addReferee()
  }

  addReferee() {
    ++this.referees
  }

  giveOwnership(node: MemoryNode) {
    this.ownershipReferences.push(node)
    node.addOwnershipReferee()
  }

  addOwnershipReferee() {
    ++this.ownershipReferees
  }

  deref() {
    --this.referees
  }

  tryDeallocate(visited: MemoryNode[] = []) {
    // If there are no ownership referees, we need to try to deallocate the structure
    if (this.ownershipReferees === 0) {
      let success = true
      this.references.forEach((reference) => {
        if (!visited.includes(reference)) {
          visited.push(reference)

          let output = reference.tryDeallocate(visited)

          if (!output) {
            success = false
          }
        }
      })

      if (success) {
        this.deleted = true
        this.references.forEach((reference) => reference.deref())
        this.references = []

        return true
      }
    }

    return false
  }

  derefOwnership() {
    --this.ownershipReferees

    this.tryDeallocate()
  }

  deallocate() {
    this.ownershipReferences.forEach((reference) => reference.derefOwnership())
    this.ownershipReferences = []

    this.deleted = true
  }
}

const fn = new MemoryNode('fn1')
const fn2 = new MemoryNode('fn2')

const a = new MemoryNode('a')
const b = new MemoryNode('b')
const c = new MemoryNode('c')

fn.giveOwnership(a)
fn.giveOwnership(b)
fn2.giveOwnership(a)

a.addReference(b)
b.addReference(c)
c.addReference(a)

console.log('// Default')
fn.inspect()
fn2.inspect()
a.inspect()
b.inspect()
c.inspect()

fn.deallocate()

console.log('// Fn1 Deallocated')
fn.inspect()
fn2.inspect()
a.inspect()
b.inspect()
c.inspect()

fn2.deallocate()

console.log('// Fn2 Deallocated')
fn.inspect()
fn2.inspect()
a.inspect()
b.inspect()
c.inspect()